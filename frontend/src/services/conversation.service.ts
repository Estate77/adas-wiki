import { http } from './http';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export const conversationService = {
  async list() {
    const r = await http.get<{ data: Conversation[] }>('/conversations');
    return r.data.data;
  },
  async create(title = '新会话') {
    const r = await http.post<{ data: Conversation }>('/conversations', { title });
    return r.data.data;
  },
  async detail(id: string) {
    const r = await http.get<{ data: Conversation }>(`/conversations/${id}`);
    return r.data.data;
  },
  async rename(id: string, title: string) {
    const r = await http.patch<{ data: Conversation }>(`/conversations/${id}`, { title });
    return r.data.data;
  },
  async remove(id: string) {
    await http.delete(`/conversations/${id}`);
  },
};
