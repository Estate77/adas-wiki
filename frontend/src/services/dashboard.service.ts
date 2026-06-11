import { http } from './http';
import type { Position } from './interview.service';

export interface MockExamRecord {
  id: string;
  score: number;
  position: Position;
  createdAt: string;
}

export interface OverviewData {
  totalQuestions: number;
  masteredCount:  number;
  mockExamCount:   number;
  averageScore:    number;
  recentMockExams: MockExamRecord[];
  dimensionMastered: Record<string, number>;
  dimensionTotal:    Record<string, number>;
}

export const dashboardService = {
  async overview(): Promise<OverviewData> {
    const r = await http.get<{ data: OverviewData }>('/dashboard/overview');
    return r.data.data;
  },
  async markMastered(knowledgeId: string) {
    await http.post(`/dashboard/mastered/${knowledgeId}`);
  },
  async unmarkMastered(knowledgeId: string) {
    await http.delete(`/dashboard/mastered/${knowledgeId}`);
  },
  async submitMockScore(payload: { score: number; position: Position }) {
    const r = await http.post<{ data: MockExamRecord }>('/dashboard/mock-score', payload);
    return r.data.data;
  },
};
