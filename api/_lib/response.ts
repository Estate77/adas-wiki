/**
 * CORS 响应头辅助函数 - 用于 Vercel Serverless
 */
import type { NextRequest } from 'next';

export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleOptions(request: NextRequest): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(request),
      ...init?.headers,
    },
  });
}

export function errorResponse(message: string, code: string, status: number): Response {
  return json({ code, message }, { status });
}

// 伪装的 request 对象用于复用中间件
export function getRequest(request: Request) {
  return request as unknown as NextRequest;
}
