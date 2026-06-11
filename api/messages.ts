/**
 * 消息 API - Vercel Serverless 版本
 */
import { NextRequest } from 'next';
import { prisma } from './_lib/prisma';
import { getUserFromRequest, HttpError } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

export async function GET(request: NextRequest) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) return errorResponse('缺少 conversationId', 'VALIDATION_ERROR', 400);

  try {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.userId !== user.userId) return errorResponse('会话不存在', 'NOT_FOUND', 404);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { citations: true },
    });
    return json({ code: 'OK', data: messages });
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  try {
    const body = await request.json();
    const { conversationId, role, content, tokensUsed, citations } = body;

    if (!conversationId || !role || !content) {
      return errorResponse('缺少必填字段', 'VALIDATION_ERROR', 400);
    }

    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.userId !== user.userId) return errorResponse('会话不存在', 'NOT_FOUND', 404);

    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        tokensUsed,
        citations: citations
          ? {
              create: citations.map((c: { knowledgeId: string; snippet: string; score?: number }) => ({
                knowledgeId: c.knowledgeId,
                snippet: c.snippet,
                score: c.score,
              })),
            }
          : undefined,
      },
      include: { citations: true },
    });

    // 更新会话时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return json({ code: 'OK', data: message }, { status: 201 });
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}
