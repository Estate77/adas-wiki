/**
 * 个人中心仪表盘聚合数据
 *  - 累计提问数（UserProgress.totalQuestions）
 *  - 掌握的知识点数量（UserKnowledgeMastery）
 *  - 模拟面试得分趋势（最近 N 条 MockExamRecord）
 *  - 各维度掌握分布（按 KnowledgeBase.dimension 分组）
 */
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middlewares/error.js';

export const dashboardService = {
  async getOverview(userId: string) {
    const [progress, mastered, recent, dimDist] = await Promise.all([
      prisma.userProgress.findUnique({ where: { userId } }),
      prisma.userKnowledgeMastery.findMany({
        where: { userId },
        include: { knowledge: { select: { dimension: true } } },
      }),
      prisma.mockExamRecord.findMany({
        where:   { userId },
        orderBy: { createdAt: 'asc' },
        take:    20,
      }),
      prisma.knowledgeBase.groupBy({
        by: ['dimension'],
        _count: { _all: true },
      }),
    ]);

    // 按维度计算掌握数
    const dimensionMastered: Record<string, number> = {};
    for (const m of mastered) {
      const d = m.knowledge.dimension;
      dimensionMastered[d] = (dimensionMastered[d] ?? 0) + 1;
    }
    const dimensionTotal: Record<string, number> = {};
    for (const d of dimDist) {
      dimensionTotal[d.dimension] = d._count._all;
    }

    return {
      totalQuestions:    progress?.totalQuestions ?? 0,
      masteredCount:     mastered.length,
      mockExamCount:     recent.length,
      averageScore:      recent.length
        ? Math.round(recent.reduce((s, r) => s + r.score, 0) / recent.length)
        : 0,
      recentMockExams:   recent,
      dimensionMastered,
      dimensionTotal,
    };
  },

  /** 标记知识点为已掌握 */
  async markMastered(userId: string, knowledgeId: string) {
    // 确认知识存在
    const kb = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeId } });
    if (!kb) throw new HttpError(404, '知识点不存在');

    await prisma.userKnowledgeMastery.upsert({
      where:  { userId_knowledgeId: { userId, knowledgeId } },
      update: {},
      create: { userId, knowledgeId },
    });
    // 同步累计数
    const count = await prisma.userKnowledgeMastery.count({ where: { userId } });
    await prisma.userProgress.upsert({
      where:  { userId },
      update: { masteredCount: count },
      create: { userId, masteredCount: count, totalQuestions: 0 },
    });
    return { ok: true, masteredCount: count };
  },

  /** 提交一次模拟面试得分 */
  async submitMockScore(userId: string, score: number, position: string) {
    if (score < 0 || score > 100) throw new HttpError(400, '分数需在 0~100');
    return prisma.mockExamRecord.create({
      data: { userId, score, position: position as any },
    });
  },
};
