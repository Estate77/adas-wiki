import { http } from './http';

export type Position =
  | 'PRODUCT_MANAGER' | 'ALGO_ENGINEER' | 'PERCEPTION_ENGINEER'
  | 'PLANNING_ENGINEER' | 'TEST_ENGINEER' | 'SAFETY_ENGINEER'
  | 'SALES_SOLUTION'  | 'OTHER';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface QuestionListItem {
  id: string;
  position: Position;
  difficulty: Difficulty;
  stem: string;
  tags: string[];
  createdAt: string;
}

export interface QuestionDetail extends QuestionListItem {
  intent: string;
  answer: string;
  keypoints: string[];
  relatedKB: { id: string; title: string; summary: string | null } | null;
  relatedKBId: string | null;
}

export interface InterviewListParams {
  position?: Position;
  difficulty?: Difficulty;
  tag?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const interviewService = {
  async list(params: InterviewListParams = {}) {
    const r = await http.get<{ data: { items: QuestionListItem[]; total: number; page: number; pageSize: number } }>(
      '/interview',
      { params },
    );
    return r.data.data;
  },
  async detail(id: string): Promise<QuestionDetail> {
    const r = await http.get<{ data: QuestionDetail }>(`/interview/${id}`);
    return r.data.data;
  },
  async create(payload: {
    position: Position; difficulty: Difficulty; stem: string;
    intent: string; answer: string; keypoints?: string[]; tags?: string[]; relatedKBId?: string;
  }) {
    const r = await http.post<{ data: QuestionDetail }>('/interview', payload);
    return r.data.data;
  },
  async update(id: string, payload: Partial<{ stem: string; intent: string; answer: string; keypoints: string[]; tags: string[]; relatedKBId: string }>) {
    const r = await http.patch<{ data: QuestionDetail }>(`/interview/${id}`, payload);
    return r.data.data;
  },
  async remove(id: string) {
    await http.delete(`/interview/${id}`);
  },
};
