import { http } from './http';

export type Dimension =
  | 'TECH_UNDERSTANDING'
  | 'PRODUCT_DEFINITION'
  | 'SAFETY_COMPLIANCE'
  | 'USER_EXPERIENCE'
  | 'BUSINESS_COMPETITION'
  | 'SCENARIO_SYSTEM_THINKING';

export interface KnowledgeListItem {
  id: string;
  title: string;
  summary: string | null;
  dimension: Dimension;
  tags: string[];
  viewCount: number;
  updatedAt: string;
}

export interface KnowledgeDetail extends KnowledgeListItem {
  content: string;
  source: string | null;
  interviewLinks: { id: string; position: string; difficulty: string; stem: string }[];
}

export interface ListParams {
  dimension?: Dimension;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const knowledgeService = {
  async list(params: ListParams = {}) {
    const r = await http.get<{ data: { items: KnowledgeListItem[]; total: number; page: number; pageSize: number } }>(
      '/knowledge',
      { params },
    );
    return r.data.data;
  },
  async detail(id: string): Promise<KnowledgeDetail> {
    const r = await http.get<{ data: KnowledgeDetail }>(`/knowledge/${id}`);
    return r.data.data;
  },
  /** 关键字搜索：用于 RAG，未命中时回退 LLM */
  async search(keyword: string, pageSize = 5) {
    const r = await http.get<{ data: { items: KnowledgeListItem[]; total: number } }>(
      '/knowledge',
      { params: { keyword, pageSize } },
    );
    return r.data.data;
  },
  async create(payload: { title: string; content: string; summary?: string; dimension: Dimension; tags?: string[]; source?: string }) {
    const r = await http.post<{ data: KnowledgeDetail }>('/knowledge', payload);
    return r.data.data;
  },
  async update(id: string, payload: Partial<{ title: string; content: string; summary: string; tags: string[]; source: string }>) {
    const r = await http.patch<{ data: KnowledgeDetail }>(`/knowledge/${id}`, payload);
    return r.data.data;
  },
  async remove(id: string) {
    await http.delete(`/knowledge/${id}`);
  },
};
