/**
 * CORS 响应头辅助函数 - 用于 Vercel Serverless
 */

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleOptions(request: Request): Response {
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
      ...getCorsHeaders(),
      ...init?.headers,
    },
  });
}

export function errorResponse(message: string, code: string, status: number): Response {
  return json({ code, message }, { status });
}

