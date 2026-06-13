/**
 * 仪表盘 API - Vercel Serverless 版本
 */
import { prisma } from './_lib/prisma';
import { getUserFromRequest } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

export async function GET(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // GET /api/dashboard?action=overview
  if (action === 'overview' || !action) {
    try {
      const [progress, mastered, recent, dimDist] = await Promise.all([
        prisma.userProgress.findUnique({ where: { userId: user.userId } }),
        prisma.userKnowledgeMastery.findMany({
          where: { userId: user.userId },
          include: { knowledge: { select: { dimension: true } } },
        }),
        prisma.mockExamRecord.findMany({
          where: { userId: user.userId },
          orderBy: { createdAt: 'asc' },
          take: 20,
        }),
        prisma.knowledgeBase.groupBy({
          by: ['dimension'],
          _count: { _all: true },
        }),
      ]);

      const dimensionMastered: Record<string, number> = {};
      for (const m of mastered) {
        const d = m.knowledge.dimension;
        dimensionMastered[d] = (dimensionMastered[d] ?? 0) + 1;
      }
      const dimensionTotal: Record<string, number> = {};
      for (const d of dimDist) {
        dimensionTotal[d.dimension] = d._count._all;
      }

      return json({
        code: 'OK',
        data: {
          totalQuestions: progress?.totalQuestions ?? 0,
          masteredCount: mastered.length,
          mockExamCount: recent.length,
          averageScore: recent.length
            ? Math.round(
                recent.reduce((sum: number, record: { score: number }) => sum + record.score, 0) /
                  recent.length
              )
            : 0,
          recentMockExams: recent,
          dimensionMastered,
          dimensionTotal,
        },
      });
    } catch (e) {
      console.error(e);
      return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
    }
  }

  return errorResponse('未知操作', 'UNKNOWN_ACTION', 400);
}

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  try {
    const body = await request.json();
    const { action } = body;

    // POST /api/dashboard { action: 'markMastered', knowledgeId }
    if (action === 'markMastered') {
      const { knowledgeId } = body;
      if (!knowledgeId) return errorResponse('缺少 knowledgeId', 'VALIDATION_ERROR', 400);

      const kb = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeId } });
      if (!kb) return errorResponse('知识点不存在', 'NOT_FOUND', 404);

      await prisma.userKnowledgeMastery.upsert({
        where: { userId_knowledgeId: { userId: user.userId, knowledgeId } },
        update: {},
        create: { userId: user.userId, knowledgeId },
      });

      const count = await prisma.userKnowledgeMastery.count({ where: { userId: user.userId } });
      await prisma.userProgress.upsert({
        where: { userId: user.userId },
        update: { masteredCount: count },
        create: { userId: user.userId, masteredCount: count, totalQuestions: 0 },
      });

      return json({ code: 'OK', data: { ok: true, masteredCount: count } });
    }

    // POST /api/dashboard { action: 'submitMockScore', score, position }
    if (action === 'submitMockScore') {
      const { score, position } = body;
      if (typeof score !== 'number' || score < 0 || score > 100) {
        return errorResponse('分数需在 0~100', 'VALIDATION_ERROR', 400);
      }

      const record = await prisma.mockExamRecord.create({
        data: { userId: user.userId, score, position: position || 'OTHER' },
      });
      return json({ code: 'OK', data: record }, { status: 201 });
    }

    return errorResponse('未知操作', 'UNKNOWN_ACTION', 400);
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}

