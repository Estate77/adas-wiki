import { Router } from 'express';
import { z } from 'zod';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middlewares/auth.js';
import { authLimiter } from '../../middlewares/rateLimit.js';

const router = Router();

// Zod 校验
const registerSchema = z.object({
  email:    z.string().email('请输入合法邮箱'),
  username: z.string().min(2, '用户名至少 2 个字符').max(24, '用户名最多 24 个字符'),
  password: z.string().min(6, '密码至少 6 位'),
});

const loginSchema = z.object({
  email:    z.string().email('请输入合法邮箱'),
  password: z.string().min(1, '请输入密码'),
});

function validate<T>(schema: z.ZodType<T>) {
  return (req: any, _res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(result.error);
    }
    req.body = result.data;
    next();
  };
}

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login',    authLimiter, validate(loginSchema),    authController.login);
router.get ('/me',       requireAuth,                          authController.me);

export default router;
