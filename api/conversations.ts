/**
 * 会话 API - Vercel Serverless 版本
 */
import { prisma } from './_lib/prisma';
import { getUserFromRequest, HttpError } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

export async function GET(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  // GET /api/conversations?path=list - 列出
  if (path === 'list') {
    try {
      const items = await prisma.conversation.findMany({
        where: { userId: user.userId },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { messages: true } } },
      });
      return json({ code: 'OK', data: items });
    } catch (e) {
      console.error(e);
      return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
    }
  }

  return errorResponse('Not Found', 'NOT_FOUND', 404);
}

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  try {
    const body = await request.json();
    const { title, action } = body;

    // POST /api/conversations { action: 'create' }
    if (action === 'create') {
      const conv = await prisma.conversation.create({
        data: { userId: user.userId, title: title?.slice(0, 60) || '新会话' },
      });
      await prisma.userProgress.upsert({
        where: { userId: user.userId },
        update: { totalQuestions: { increment: 1 } },
        create: { userId: user.userId, totalQuestions: 1, masteredCount: 0 },
      });
      return json({ code: 'OK', data: conv }, { status: 201 });
    }

    // POST /api/conversations { action: 'rename', id, title }
    if (action === 'rename') {
      if (!body.id || !body.title) return errorResponse('缺少参数', 'VALIDATION_ERROR', 400);
      const conv = await prisma.conversation.update({
        where: { id: body.id },
        data: { title: String(body.title).slice(0, 60) },
      });
      return json({ code: 'OK', data: conv });
    }

    // POST /api/conversations { action: 'delete', id }
    if (action === 'delete') {
      if (!body.id) return errorResponse('缺少参数', 'VALIDATION_ERROR', 400);
      const conv = await prisma.conversation.findUnique({ where: { id: body.id } });
      if (!conv || conv.userId !== user.userId) return errorResponse('会话不存在', 'NOT_FOUND', 404);
      await prisma.conversation.delete({ where: { id: body.id } });
      return json({ code: 'OK', data: { ok: true } });
    }

    return errorResponse('未知操作', 'UNKNOWN_ACTION', 400);
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}

