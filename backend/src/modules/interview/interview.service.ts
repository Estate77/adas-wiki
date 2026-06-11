/**
 * 面试题 CRUD（兼容 SQLite：tags 字符串→数组，移除 mode:'insensitive'）
 */
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middlewares/error.js';

export type Position =
  | 'PRODUCT_MANAGER' | 'ALGO_ENGINEER' | 'PERCEPTION_ENGINEER'
  | 'PLANNING_ENGINEER' | 'TEST_ENGINEER' | 'SAFETY_ENGINEER'
  | 'SALES_SOLUTION'  | 'OTHER';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

function safeParseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}
function safeParseKeypoints(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}
function decodeQ<T extends { tags: unknown; keypoints?: unknown }>(q: T) {
  return {
    ...q,
    tags:      safeParseTags(q.tags),
    keypoints: safeParseKeypoints(q.keypoints ?? []),
  } as Omit<T, 'tags' | 'keypoints'> & { tags: string[]; keypoints: string[] };
}

export const interviewService = {
  async list(params: {
    position?:   Position;
    difficulty?: QuestionDifficulty;
    tag?:        string;
    keyword?:    string;
    page?:       number;
    pageSize?:   number;
  }) {
    const page     = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
    const where: any = {};
    if (params.position)   where.position   = params.position;
    if (params.difficulty) where.difficulty = params.difficulty;
    if (params.tag)        where.tags       = { contains: params.tag };
    if (params.keyword)    where.stem       = { contains: params.keyword };

    const [items, total] = await Promise.all([
      prisma.interviewQuestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
        select: { id: true, position: true, difficulty: true, stem: true, tags: true, createdAt: true },
      }),
      prisma.interviewQuestion.count({ where }),
    ]);
    return { items: items.map(decodeQ), total, page, pageSize };
  },

  async detail(id: string) {
    const q = await prisma.interviewQuestion.findUnique({
      where:   { id },
      include: { relatedKB: { select: { id: true, title: true, summary: true } } },
    });
    if (!q) throw new HttpError(404, '题目不存在');
    return decodeQ(q);
  },

  async create(data: {
    position:   Position;
    difficulty: QuestionDifficulty;
    stem:       string;
    intent:     string;
    answer:     string;
    keypoints?: string[];
    tags?:      string[];
    relatedKBId?: string;
  }) {
    const created = await prisma.interviewQuestion.create({
      data: {
        ...data,
        tags:      JSON.stringify(data.tags ?? []),
        keypoints: JSON.stringify(data.keypoints ?? []),
      },
    });
    return decodeQ(created);
  },

  async update(id: string, data: Partial<{
    stem: string; intent: string; answer: string; tags: string[]; keypoints: string[]; relatedKBId: string;
  }>) {
    const patch: any = { ...data };
    if (Array.isArray(data.tags))      patch.tags      = JSON.stringify(data.tags);
    if (Array.isArray(data.keypoints)) patch.keypoints = JSON.stringify(data.keypoints);
    const updated = await prisma.interviewQuestion.update({ where: { id }, data: patch });
    return decodeQ(updated);
  },

  async remove(id: string) {
    await prisma.interviewQuestion.delete({ where: { id } });
    return { ok: true };
  },
};
