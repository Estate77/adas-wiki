import {
  createDemoId,
  listInterviewRecords,
  listKnowledgeRecords,
  saveInterviewRecords,
} from './demo-db';

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
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 20);
    const keyword = params.keyword?.trim().toLowerCase();

    let items = listInterviewRecords();
    if (params.position) {
      items = items.filter((item) => item.position === params.position);
    }
    if (params.difficulty) {
      items = items.filter((item) => item.difficulty === params.difficulty);
    }
    if (params.tag) {
      items = items.filter((item) => item.tags.includes(params.tag!));
    }
    if (keyword) {
      items = items.filter((item) =>
        [item.stem, item.intent, item.answer, item.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    items = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize).map(({ intent, answer, keypoints, relatedKBId, ...item }) => item),
      total,
      page,
      pageSize,
    };
  },
  async detail(id: string): Promise<QuestionDetail> {
    const item = listInterviewRecords().find((record) => record.id === id);
    if (!item) throw new Error('题目不存在');

    const relatedKB = item.relatedKBId
      ? listKnowledgeRecords().find((record) => record.id === item.relatedKBId) ?? null
      : null;

    return {
      ...item,
      relatedKBId: item.relatedKBId,
      relatedKB: relatedKB
        ? {
            id: relatedKB.id,
            title: relatedKB.title,
            summary: relatedKB.summary,
          }
        : null,
    };
  },
  async create(payload: {
    position: Position; difficulty: Difficulty; stem: string;
    intent: string; answer: string; keypoints?: string[]; tags?: string[]; relatedKBId?: string;
  }) {
    const item = {
      id: createDemoId('q'),
      position: payload.position,
      difficulty: payload.difficulty,
      stem: payload.stem.trim(),
      intent: payload.intent.trim(),
      answer: payload.answer.trim(),
      keypoints: payload.keypoints ?? [],
      tags: payload.tags ?? [],
      relatedKBId: payload.relatedKBId ?? null,
      createdAt: new Date().toISOString(),
    };
    saveInterviewRecords([item, ...listInterviewRecords()]);
    return this.detail(item.id);
  },
  async update(id: string, payload: Partial<{ stem: string; intent: string; answer: string; keypoints: string[]; tags: string[]; relatedKBId: string }>) {
    const items = listInterviewRecords();
    const current = items.find((item) => item.id === id);
    if (!current) throw new Error('题目不存在');

    const updated = {
      ...current,
      stem: payload.stem?.trim() ?? current.stem,
      intent: payload.intent?.trim() ?? current.intent,
      answer: payload.answer?.trim() ?? current.answer,
      keypoints: payload.keypoints ?? current.keypoints,
      tags: payload.tags ?? current.tags,
      relatedKBId: payload.relatedKBId === undefined ? current.relatedKBId : payload.relatedKBId,
    };
    saveInterviewRecords(items.map((item) => (item.id === id ? updated : item)));
    return this.detail(id);
  },
  async remove(id: string) {
    saveInterviewRecords(listInterviewRecords().filter((item) => item.id !== id));
  },
};
