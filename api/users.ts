/**
 * 用户 API - Vercel Serverless 版本
 */
import { NextRequest } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from './_lib/prisma';
import { getUserFromRequest } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

export async function GET(request: NextRequest) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // GET /api/users?action=profile
  if (action === 'profile' || !action) {
    try {
      const found = await prisma.user.findUnique({
        where: { id: user.userId },
        include: { progress: true },
      });
      if (!found) return errorResponse('用户不存在', 'USER_NOT_FOUND', 404);

      return json({
        code: 'OK',
        data: {
          id: found.id,
          email: found.email,
          username: found.username,
          role: found.role,
          avatar: found.avatar,
          bio: found.bio,
          createdAt: found.createdAt,
          progress: found.progress,
        },
      });
    } catch (e) {
      console.error(e);
      return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
    }
  }

  return errorResponse('未知操作', 'UNKNOWN_ACTION', 400);
}

export async function PATCH(request: NextRequest) {
  if (request.method === 'OPTIONS') return handleOptions(request);

  const user = getUserFromRequest(request);
  if (!user) return errorResponse('未登录', 'UNAUTHENTICATED', 401);

  try {
    const body = await request.json();
    const { username, bio, avatar, password } = body;
    const patch: any = {};

    if (username) patch.username = username;
    if (bio !== undefined) patch.bio = bio;
    if (avatar !== undefined) patch.avatar = avatar;
    if (password) patch.passwordHash = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: patch,
    });

    return json({
      code: 'OK',
      data: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        role: updated.role,
        avatar: updated.avatar,
        bio: updated.bio,
        createdAt: updated.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}
