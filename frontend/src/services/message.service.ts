import { http } from './http';

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

export const messageService = {
  /** 列出指定会话的全部消息（按时间升序） */
  async listByConversation(conversationId: string) {
    const r = await http.get<{ data: Message[] }>(`/messages/conversation/${conversationId}`);
    return r.data.data;
  },
  /** 用户发送一条新消息（同步调用；流式请用 qna.streamChat） */
  async send(conversationId: string, content: string) {
    const r = await http.post<{ data: Message }>('/messages', {
      conversationId,
      role: 'USER',
      content,
    });
    return r.data.data;
  },
  /** 助手追加一条消息（仅在流式完成后由前端调用，便于在 DB 落库） */
  async appendAssistant(conversationId: string, content: string, tokensUsed?: number) {
    const r = await http.post<{ data: Message }>('/messages', {
      conversationId,
      role: 'ASSISTANT',
      content,
      tokensUsed,
    });
    return r.data.data;
  },
};
