/**
 * 全局错误处理中间件
 */
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ code: 'NOT_FOUND', message: '资源不存在' });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: '参数校验失败',
      details: err.flatten(),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ code: err.code ?? 'ERROR', message: err.message });
  }
  console.error('[ERR]', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: '服务器内部错误' });
}
