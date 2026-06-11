import {
  createDemoId,
  getCurrentUserRecord,
  listConversations,
  listMessages,
  saveConversations,
  saveMessages,
  type DemoConversationRecord,
  type DemoMessageRecord,
} from './demo-db';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export const conversationService = {
  async list(): Promise<Conversation[]> {
    const current = getCurrentUserRecord();
    if (!current) return [];
    const items = listConversations()
      .filter((item) => item.userId === current.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const allMessages = listMessages();
    return items.map((item) => ({
      ...item,
      messageCount: allMessages.filter((message) => message.conversationId === item.id).length,
    }));
  },
  async create(title = '新会话') {
    const current = getCurrentUserRecord();
    if (!current) throw new Error('请先登录');
    const now = new Date().toISOString();
    const conv: DemoConversationRecord = {
      id: createDemoId('conv'),
      userId: current.id,
      title: title.slice(0, 60),
      createdAt: now,
      updatedAt: now,
    };
    saveConversations([conv, ...listConversations()]);
    return conv;
  },
  async detail(id: string) {
    const conv = listConversations().find((item) => item.id === id);
    if (!conv) throw new Error('会话不存在');
    return conv;
  },
  async rename(id: string, title: string) {
    const items = listConversations();
    const conv = items.find((item) => item.id === id);
    if (!conv) throw new Error('会话不存在');
    const updated: DemoConversationRecord = {
      ...conv,
      title: String(title).slice(0, 60),
      updatedAt: new Date().toISOString(),
    };
    saveConversations(items.map((item) => (item.id === id ? updated : item)));
    return updated;
  },
  async remove(id: string) {
    saveConversations(listConversations().filter((item) => item.id !== id));
    saveMessages(listMessages().filter((message) => message.conversationId !== id));
  },
};
