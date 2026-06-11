import {
  createDemoId,
  getCurrentUserRecord,
  listConversations,
  listMessages,
  saveConversations,
  saveMessages,
  type DemoMessageRecord,
} from './demo-db';

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Citation {
  id: string;
  knowledgeId: string;
  snippet: string;
  score: number | null;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number | null;
  createdAt: string;
  citations?: Citation[];
}

function touchConversation(conversationId: string) {
  const items = listConversations();
  const conv = items.find((item) => item.id === conversationId);
  if (!conv) return;
  saveConversations(
    items.map((item) => (item.id === conversationId ? { ...item, updatedAt: new Date().toISOString() } : item))
  );
}

function ensureOwnership(conversationId: string) {
  const current = getCurrentUserRecord();
  if (!current) throw new Error('请先登录');
  const conv = listConversations().find((item) => item.id === conversationId);
  if (!conv) throw new Error('会话不存在');
  if (conv.userId !== current.id) throw new Error('无权访问该会话');
}

export const messageService = {
  async listByConversation(conversationId: string): Promise<Message[]> {
    ensureOwnership(conversationId);
    return listMessages()
      .filter((item) => item.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((item) => ({ ...item, role: item.role as MessageRole }));
  },
  async send(conversationId: string, content: string) {
    ensureOwnership(conversationId);
    const now = new Date().toISOString();
    const message: DemoMessageRecord = {
      id: createDemoId('msg'),
      conversationId,
      role: 'USER',
      content,
      tokensUsed: null,
      createdAt: now,
    };
    saveMessages([...listMessages(), message]);
    touchConversation(conversationId);
    return message;
  },
  async appendAssistant(conversationId: string, content: string, tokensUsed?: number) {
    ensureOwnership(conversationId);
    const now = new Date().toISOString();
    const message: DemoMessageRecord = {
      id: createDemoId('msg'),
      conversationId,
      role: 'ASSISTANT',
      content,
      tokensUsed: tokensUsed ?? null,
      createdAt: now,
    };
    saveMessages([...listMessages(), message]);
    touchConversation(conversationId);
    return message;
  },
};
