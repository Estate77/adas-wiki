/**
 * 知识库 API - Vercel Serverless 版本
 */
import { prisma } from './_lib/prisma';
import { getUserFromRequest } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

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

export async function GET(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const { searchParams } = new URL(request.url);
  const dimension = searchParams.get('dimension');
  const keyword = searchParams.get('keyword');
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));
  const id = searchParams.get('id');

  // GET /api/knowledge?id=xxx - 详情
  if (id) {
    try {
      const kb = await prisma.knowledgeBase.findUnique({
        where: { id },
        include: { interviewLinks: { select: { id: true, position: true, difficulty: true, stem: true } } },
      });
      if (!kb) return errorResponse('知识不存在', 'NOT_FOUND', 404);
      await prisma.knowledgeBase.update({ where: { id }, data: { viewCount: { increment: 1 } } });
      return json({ code: 'OK', data: decodeKb(kb) });
    } catch (e) {
      console.error(e);
      return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
    }
  }

  // GET /api/knowledge?keyword=xxx&dimension=xxx&page=1&pageSize=20 - 列表
  try {
    const where: any = {};
    if (dimension) where.dimension = dimension;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { summary: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, title: true, summary: true, dimension: true, tags: true, updatedAt: true, viewCount: true },
      }),
      prisma.knowledgeBase.count({ where }),
    ]);

    return json({ code: 'OK', data: { items: items.map(decodeKb), total, page, pageSize } });
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  try {
    const body = await request.json();
    const { title, content, summary, dimension, tags, source } = body;

    if (!title || !content || !dimension) {
      return errorResponse('缺少必填字段', 'VALIDATION_ERROR', 400);
    }

    const created = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        summary,
        dimension,
        tags: JSON.stringify(tags ?? []),
        source,
      },
    });

    return json({ code: 'OK', data: decodeKb(created) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}

