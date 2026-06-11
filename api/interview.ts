/**
 * 面试题 API - Vercel Serverless 版本
 */
import { NextRequest } from 'next';
import { prisma } from './_lib/prisma';
import { getUserFromRequest } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

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
    tags: safeParseTags(q.tags),
    keypoints: safeParseKeypoints(q.keypoints ?? []),
  } as Omit<T, 'tags' | 'keypoints'> & { tags: string[]; keypoints: string[] };
}

export async function GET(request: NextRequest) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const position = searchParams.get('position');
  const difficulty = searchParams.get('difficulty');
  const tag = searchParams.get('tag');
  const keyword = searchParams.get('keyword');
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));

  // GET /api/interview?id=xxx - 详情
  if (id) {
    try {
      const q = await prisma.interviewQuestion.findUnique({
        where: { id },
        include: { relatedKB: { select: { id: true, title: true, summary: true } } },
      });
      if (!q) return errorResponse('题目不存在', 'NOT_FOUND', 404);
      return json({ code: 'OK', data: decodeQ(q) });
    } catch (e) {
      console.error(e);
      return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
    }
  }

  // 列表查询
  try {
    const where: any = {};
    if (position) where.position = position;
    if (difficulty) where.difficulty = difficulty;
    if (tag) where.tags = { contains: tag };
    if (keyword) where.stem = { contains: keyword };

    const [items, total] = await Promise.all([
      prisma.interviewQuestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, position: true, difficulty: true, stem: true, tags: true, createdAt: true },
      }),
      prisma.interviewQuestion.count({ where }),
    ]);

    return json({ code: 'OK', data: { items: items.map(decodeQ), total, page, pageSize } });
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
    const { position, difficulty, stem, intent, answer, keypoints, tags, relatedKBId } = body;

    if (!position || !difficulty || !stem || !intent || !answer) {
      return errorResponse('缺少必填字段', 'VALIDATION_ERROR', 400);
    }

    const created = await prisma.interviewQuestion.create({
      data: {
        position,
        difficulty,
        stem,
        intent,
        answer,
        tags: JSON.stringify(tags ?? []),
        keypoints: JSON.stringify(keypoints ?? []),
        relatedKBId,
      },
    });

    return json({ code: 'OK', data: decodeQ(created) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}
