/**
 * JWT 鉴权辅助函数 - 用于 Vercel Serverless
 */
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-please-change-me';

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signToken(
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET as Secret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getUserFromRequest(request: Request): JwtPayload | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return verifyToken(auth.slice(7));
  } catch {
    return null;
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}
