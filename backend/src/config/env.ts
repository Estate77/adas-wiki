import dotenv from 'dotenv';
dotenv.config();

function required(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export const env = {
  NODE_ENV:        process.env.NODE_ENV ?? 'development',
  PORT:            Number(process.env.PORT ?? 4000),
  DATABASE_URL:    required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/adas_wiki'),
  JWT_SECRET:      required('JWT_SECRET',  'dev-secret-please-change-me'),
  JWT_EXPIRES_IN:  process.env.JWT_EXPIRES_IN ?? '7d',
  BCRYPT_ROUNDS:   Number(process.env.BCRYPT_ROUNDS ?? 10),
  AI_SERVICE_URL:  process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
  CORS_ORIGIN:     process.env.CORS_ORIGIN  ?? '*',
};
