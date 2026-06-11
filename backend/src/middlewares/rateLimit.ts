import rateLimit from 'express-rate-limit';

/** 登录/注册限流：15 分钟内最多 20 次 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: 'RATE_LIMITED', message: '操作过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** 通用 API 限流：1 分钟内最多 120 次 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
