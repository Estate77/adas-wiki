/**
 * 知识库 CRUD（基础版；生产环境建议加上 admin 权限校验）
 * 兼容 SQLite：dimension 用字面量字符串；tags 在读写时 JSON 序列化/反序列化。
 */
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middlewares/error.js';

export type Dimension =
  | 'TECH_UNDERSTANDING'
  | 'PRODUCT_DEFINITION'
  | 'SAFETY_COMPLIANCE'
  | 'USER_EXPERIENCE'
  | 'BUSINESS_COMPETITION'
  | 'SCENARIO_SYSTEM_THINKING';

function safeParseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function decodeKb<T extends { tags: unknown }>(kb: T) {
  return { ...kb, tags: safeParseTags(kb.tags) } as Omit<T, 'tags'> & { tags: string[] };
}

export const knowledgeService = {
  /** 列表（支持按维度 / 关键字过滤） */
  async list(params: { dimension?: Dimension; keyword?: string; page?: number; pageSize?: number }) {
    const page     = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
    const where: any = {};
    if (params.dimension) where.dimension = params.dimension;
    if (params.keyword) {
      where.OR = [
        { title:   { contains: params.keyword } },
        { summary: { contains: params.keyword } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
        select: { id: true, title: true, summary: true, dimension: true, tags: true, updatedAt: true, viewCount: true },
      }),
      prisma.knowledgeBase.count({ where }),
    ]);
    return { items: items.map(decodeKb), total, page, pageSize };
  },

  /** 详情 */
  async detail(id: string) {
    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: { interviewLinks: { select: { id: true, position: true, difficulty: true, stem: true } } },
    });
    if (!kb) throw new HttpError(404, '知识不存在');
    // 累加阅读数
    await prisma.knowledgeBase.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return decodeKb(kb);
  },

  /** 创建 */
  async create(data: { title: string; content: string; summary?: string; dimension: Dimension; tags?: string[]; source?: string }) {
    const created = await prisma.knowledgeBase.create({
      data: { ...data, tags: JSON.stringify(data.tags ?? []) },
    });
    return decodeKb(created);
  },

  /** 更新 */
  async update(id: string, data: Partial<{ title: string; content: string; summary: string; tags: string[]; source: string }>) {
    const patch: any = { ...data };
    if (Array.isArray(data.tags)) patch.tags = JSON.stringify(data.tags);
    const updated = await prisma.knowledgeBase.update({ where: { id }, data: patch });
    return decodeKb(updated);
  },

  /** 删除 */
  async remove(id: string) {
    await prisma.knowledgeBase.delete({ where: { id } });
    return { ok: true };
  },
};
