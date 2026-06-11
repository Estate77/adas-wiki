import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  role:   string;
}

export function signToken(payload: JwtPayload, expiresIn: string = env.JWT_EXPIRES_IN): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
