import type { Position } from './interview.service';
import {
  createDemoId,
  getChatQuestionCount,
  getCurrentUserRecord,
  getUserProgressRecord,
  listKnowledgeRecords,
  saveUserProgressRecord,
} from './demo-db';

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
    const current = getCurrentUserRecord();
    if (!current) throw new Error('请先登录后查看个人仪表盘');

    const knowledge = listKnowledgeRecords();
    const progress = getUserProgressRecord(current.id);

    const dimensionTotal = knowledge.reduce<Record<string, number>>((acc, item) => {
      acc[item.dimension] = (acc[item.dimension] ?? 0) + 1;
      return acc;
    }, {});

    const dimensionMastered = knowledge.reduce<Record<string, number>>((acc, item) => {
      if (progress.masteredKnowledgeIds.includes(item.id)) {
        acc[item.dimension] = (acc[item.dimension] ?? 0) + 1;
      }
      return acc;
    }, {});

    const recentMockExams = [...progress.mockExamRecords].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const averageScore = recentMockExams.length
      ? Math.round(recentMockExams.reduce((sum, record) => sum + record.score, 0) / recentMockExams.length)
      : 0;

    return {
      totalQuestions: getChatQuestionCount(),
      masteredCount: progress.masteredKnowledgeIds.length,
      mockExamCount: recentMockExams.length,
      averageScore,
      recentMockExams,
      dimensionMastered,
      dimensionTotal,
    };
  },
  async markMastered(knowledgeId: string) {
    const current = getCurrentUserRecord();
    if (!current) throw new Error('请先登录');

    const progress = getUserProgressRecord(current.id);
    if (!progress.masteredKnowledgeIds.includes(knowledgeId)) {
      progress.masteredKnowledgeIds = [...progress.masteredKnowledgeIds, knowledgeId];
      saveUserProgressRecord(current.id, progress);
    }
  },
  async unmarkMastered(knowledgeId: string) {
    const current = getCurrentUserRecord();
    if (!current) throw new Error('请先登录');

    const progress = getUserProgressRecord(current.id);
    progress.masteredKnowledgeIds = progress.masteredKnowledgeIds.filter((id) => id !== knowledgeId);
    saveUserProgressRecord(current.id, progress);
  },
  async submitMockScore(payload: { score: number; position: Position }) {
    const current = getCurrentUserRecord();
    if (!current) throw new Error('请先登录');

    const progress = getUserProgressRecord(current.id);
    const record: MockExamRecord = {
      id: createDemoId('mock'),
      score: payload.score,
      position: payload.position,
      createdAt: new Date().toISOString(),
    };
    progress.mockExamRecords = [...progress.mockExamRecords, record];
    saveUserProgressRecord(current.id, progress);
    return record;
  },
};
