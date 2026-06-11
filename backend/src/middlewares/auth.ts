/**
 * JWT 鉴权中间件：解析 Authorization: Bearer <token>
 *  - 通过后将 req.user 注入
 *  - 可选模式：optionalAuth（不强制登录）
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';
import { HttpError } from './error.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return next(new HttpError(401, '未登录', 'UNAUTHENTICATED'));
  }
  const token = auth.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new HttpError(401, '登录已过期，请重新登录', 'TOKEN_EXPIRED'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next();
  try {
    req.user = verifyToken(auth.slice(7));
  } catch {
    /* 忽略无效 token */
  }
  next();
}
