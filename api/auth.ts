/**
 * 鉴权 API - Vercel Serverless 版本
 */
import { NextRequest } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './_lib/prisma';
import { signToken, verifyToken, HttpError, getUserFromRequest } from './_lib/auth';
import { json, errorResponse, handleOptions } from './_lib/response';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-please-change-me';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

export const config = {
  api: {
    bodyParser: true,
  },
};

export async function GET(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const url = new URL(request.url);

  // GET /api/auth/me - 获取当前用户
  if (url.pathname === '/api/auth/me') {
    const user = getUserFromRequest(request);
    if (!user) {
      return errorResponse('未登录', 'UNAUTHENTICATED', 401);
    }

    try {
      const found = await prisma.user.findUnique({
        where: { id: user.userId },
        include: { progress: true },
      });
      if (!found) {
        return errorResponse('用户不存在', 'USER_NOT_FOUND', 404);
      }
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
        },
      });
    } catch (e) {
      console.error('[auth/me]', e);
      return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
    }
  }

  return errorResponse('Not Found', 'NOT_FOUND', 404);
}

export async function POST(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    const body = await request.json();

    // POST /api/auth/register
    if (pathname === '/api/auth/register') {
      const { email, username, password } = body;

      if (!email || !username || !password) {
        return errorResponse('缺少必填字段', 'VALIDATION_ERROR', 400);
      }
      if (password.length < 6) {
        return errorResponse('密码至少6位', 'VALIDATION_ERROR', 400);
      }

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existing) {
        return errorResponse('邮箱或用户名已被注册', 'USER_EXISTS', 409);
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          progress: { create: { totalQuestions: 0, masteredCount: 0 } },
        },
      });

      const token = signToken({ userId: user.id, role: user.role });
      return json(
        {
          code: 'OK',
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              avatar: user.avatar,
              bio: user.bio,
              createdAt: user.createdAt,
            },
          },
        },
        { status: 201 }
      );
    }

    // POST /api/auth/login
    if (pathname === '/api/auth/login') {
      const { email, password } = body;

      if (!email || !password) {
        return errorResponse('缺少必填字段', 'VALIDATION_ERROR', 400);
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return errorResponse('邮箱或密码错误', 'INVALID_CREDENTIALS', 401);
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return errorResponse('邮箱或密码错误', 'INVALID_CREDENTIALS', 401);
      }

      const token = signToken({ userId: user.id, role: user.role });
      return json({
        code: 'OK',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
          },
        },
      });
    }

    return errorResponse('Not Found', 'NOT_FOUND', 404);
  } catch (e) {
    console.error('[auth POST]', e);
    if (e instanceof SyntaxError) {
      return errorResponse('无效的 JSON', 'PARSE_ERROR', 400);
    }
    return errorResponse('服务器内部错误', 'INTERNAL_ERROR', 500);
  }
}
