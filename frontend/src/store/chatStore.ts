import { create } from 'zustand';
import type { Citation, Conversation, Message } from '@/types/chat';
import { askStream } from '@/services/qna.service';
import { knowledgeService } from '@/services/knowledge.service';
import { llmService } from '@/services/llm.service';

interface ChatState {
  // ==== 会话 ====
  conversations: Conversation[];
  currentId: string | null;
  // ==== 消息：conversationId -> Message[] ====
  messages: Record<string, Message[]>;
  // ==== 流式状态 ====
  isStreaming: boolean;
  abortCtrl: AbortController | null;

  // ============ Actions ============
  bootstrap: () => void;            // 首次加载：读 localStorage
  newConversation: () => string;    // 新建并选中
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;

  /** 发送用户消息并触发流式回答 */
  sendMessage: (content: string) => Promise<void>;
  /** 停止当前流 */
  stopStream: () => void;
  /** 重新生成最后一条助手消息 */
  regenerateLast: () => Promise<void>;
  /** 清空所有 */
  clearAll: () => void;
}

// ---------- 持久化 ----------
const STORAGE_KEY = 'adas_qna_v1';
interface PersistedShape {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  currentId: string | null;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadFromStorage(): PersistedShape {
  if (!isBrowser()) {
    return { conversations: [], messages: {}, currentId: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: [], messages: {}, currentId: null };
    return JSON.parse(raw) as PersistedShape;
  } catch {
    return { conversations: [], messages: {}, currentId: null };
  }
}

function saveToStorage(state: PersistedShape) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 忽略 */
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeId(prefix = '') {
  return prefix + uid();
}

// ---------- Store ----------
export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentId: null,
  messages: {},
  isStreaming: false,
  abortCtrl: null,

  bootstrap: () => {
    const persisted = loadFromStorage();
    if (persisted.conversations.length === 0) {
      // 首次进入：自动创建一个欢迎会话
      const id = makeId('c_');
      const welcome: Conversation = {
        id,
        title: '欢迎使用智驾百科',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0,
      };
      const greeting: Message = {
        id: makeId('m_'),
        conversationId: id,
        role: 'ASSISTANT',
        content:
          '你好！我是智驾百科的 AI 助手 🤖\n\n你可以问我任何智能驾驶相关的问题，例如：\n\n- 激光雷达的工作原理是什么？\n- BEV 和 Occupancy Network 有什么关系？\n- 端到端自动驾驶和模块化有什么区别？\n- ISO 26262 和 SOTIF 有什么区别？\n\n当前为 **纯前端 Demo 模式**，回答与会话都保存在当前浏览器中，无需后端或数据库。',
        createdAt: Date.now(),
      };
      const next: PersistedShape = {
        conversations: [welcome],
        messages: { [id]: [greeting] },
        currentId: id,
      };
      set({
        conversations: [welcome],
        messages: { [id]: [greeting] },
        currentId: id,
      });
      saveToStorage(next);
    } else {
      set(persisted);
    }
  },

  newConversation: () => {
    const id = makeId('c_');
    const conv: Conversation = {
      id,
      title: '新会话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    };
    set((s) => {
      const next = {
        conversations: [conv, ...s.conversations],
        messages: { ...s.messages, [id]: [] },
        currentId: id,
      };
      saveToStorage(next);
      return next;
    });
    return id;
  },

  selectConversation: (id) => {
    set((s) => {
      const next = { ...s, currentId: id };
      saveToStorage({
        conversations: next.conversations,
        messages: next.messages,
        currentId: next.currentId,
      });
      return { currentId: id };
    });
  },

  deleteConversation: (id) => {
    set((s) => {
      const conversations = s.conversations.filter((c) => c.id !== id);
      const messages = { ...s.messages };
      delete messages[id];
      const currentId =
        s.currentId === id
          ? conversations[0]?.id ?? null
          : s.currentId;
      const next = { conversations, messages, currentId };
      saveToStorage(next);
      return next;
    });
  },

  renameConversation: (id, title) => {
    set((s) => {
      const conversations = s.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
      );
      const next = { ...s, conversations };
      saveToStorage({
        conversations: next.conversations,
        messages: next.messages,
        currentId: next.currentId,
      });
      return { conversations };
    });
  },

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const state = get();

    // 1. 如果没有当前会话则自动创建
    let conversationId = state.currentId;
    if (!conversationId) conversationId = get().newConversation();

    // 2. 推入用户消息
    const userMsg: Message = {
      id: makeId('m_'),
      conversationId,
      role: 'USER',
      content: trimmed,
      createdAt: Date.now(),
    };

    // 3. 预创建一条空的助手消息（用于流式 append）
    const assistantMsg: Message = {
      id: makeId('m_'),
      conversationId,
      role: 'ASSISTANT',
      content: '',
      citations: [],
      followups: [],
      isStreaming: true,
      createdAt: Date.now(),
    };

    set((s) => {
      const msgs = s.messages[conversationId!] ?? [];
      const convs = s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              title: msgs.length === 0 ? trimmed.slice(0, 30) : c.title,
              preview: trimmed.slice(0, 60),
              updatedAt: Date.now(),
              messageCount: msgs.length + 2,
            }
          : c,
      );
      const next = {
        conversations: convs,
        messages: {
          ...s.messages,
          [conversationId!]: [...msgs, userMsg, assistantMsg],
        },
        isStreaming: true,
        abortCtrl: new AbortController(),
      };
      saveToStorage({
        conversations: next.conversations,
        messages: next.messages,
        currentId: s.currentId,
      });
      return next;
    });

    // 4. 路由：先查 KB；未命中则走 LLM 兜底
    const abortCtrl = get().abortCtrl!;
    const conversationIdSafe = conversationId!;
    const assistantId = assistantMsg.id;

    const updateAssistant = (mutator: (m: Message) => Message) => {
      set((s) => {
        const msgs = s.messages[conversationIdSafe] ?? [];
        const idx = msgs.findIndex((m) => m.id === assistantId);
        if (idx < 0) return {};
        const newMsgs = [...msgs];
        newMsgs[idx] = mutator(msgs[idx]);
        return { messages: { ...s.messages, [conversationIdSafe]: newMsgs } };
      });
    };

    const handleStreamEvent = (ev: any) => {
      updateAssistant((target) => {
        const next = { ...target };
        switch (ev.type) {
          case 'delta':
            next.content += ev.text;
            break;
          case 'citation':
            next.citations = [...(next.citations ?? []), ev.citation];
            break;
          case 'followup':
            next.followups = ev.suggestions;
            break;
          case 'structure':
            next.structured = ev.answer;
            break;
          case 'done':
            next.isStreaming = false;
            break;
          case 'error':
            next.content += `\n\n> ⚠️ ${ev.message}`;
            next.isStreaming = false;
            break;
        }
        return next;
      });
    };

    const onComplete = () => {
      set((s) => {
        const next = { ...s, isStreaming: false, abortCtrl: null };
        saveToStorage({
          conversations: next.conversations,
          messages: next.messages,
          currentId: next.currentId,
        });
        return { isStreaming: false, abortCtrl: null };
      });
    };

    const onError = (err: Error) => {
      updateAssistant((m) => ({
        ...m,
        content:
          m.content + (m.content ? '\n\n' : '') + `> ⚠️ 请求失败：${err.message}`,
        isStreaming: false,
      }));
      set({ isStreaming: false, abortCtrl: null });
    };

    // 4.1 尝试 KB 检索
    let usedKB = false;
    try {
      const result = await knowledgeService.search(trimmed, 5);
      if (result.items.length > 0) {
        const top = result.items[0];
        // 命中：把 KB 信息注入 assistant 消息
        updateAssistant((m) => ({
          ...m,
          source: 'KB',
          knowledgeId: top.id,
          citations: [
            {
              knowledgeId: top.id,
              title: top.title,
              snippet: top.summary ?? '',
              score: 0.9,
            },
          ],
        }));
        usedKB = true;
        // 命中后调用 KB 详情以拉取完整内容（可用于后续溯源展示）
        try {
          await knowledgeService.detail(top.id);
        } catch { /* 详情拉取失败不影响流式输出 */ }
        // 直接复用 qna.service 的 mock 流式（保持六维结构 + 追问）
        await askStream(
          { conversationId, content: trimmed },
          {
            signal: abortCtrl.signal,
            onEvent: handleStreamEvent,
            onComplete,
            onError,
          },
        );
        return;
      }
    } catch {
      // KB 检索失败，继续走 LLM 兜底
    }

    if (usedKB) return;

    // 4.2 未命中 KB：调用 LLM 兜底
    updateAssistant((m) => ({ ...m, source: 'LLM' }));
    await llmService.generate(
      { prompt: trimmed },
      {
        signal: abortCtrl.signal,
        onEvent: handleStreamEvent,
        onComplete,
        onError,
      },
    );
  },

  stopStream: () => {
    const ctrl = get().abortCtrl;
    if (ctrl) ctrl.abort();
    set({ isStreaming: false, abortCtrl: null });
  },

  regenerateLast: async () => {
    const s = get();
    if (!s.currentId) return;
    const msgs = s.messages[s.currentId] ?? [];
    if (msgs.length < 2) return;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'USER');
    if (!lastUser) return;
    // 简化：直接重发最后一条 user
    await get().sendMessage(lastUser.content);
  },

  clearAll: () => {
    set({
      conversations: [],
      messages: {},
      currentId: null,
      isStreaming: false,
      abortCtrl: null,
    });
    if (isBrowser()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));

// 工具：获取当前消息
export function useCurrentMessages(): Message[] {
  return useChatStore((s) => {
    if (!s.currentId) return [];
    return s.messages[s.currentId] ?? [];
  });
}
