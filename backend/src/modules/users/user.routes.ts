import { Router } from 'express';
import { z } from 'zod';
import { userController } from './user.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

const updateSchema = z.object({
  username: z.string().min(2).max(24).optional(),
  bio:      z.string().max(200).optional(),
  avatar:   z.string().url().optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

function validate<T>(schema: z.ZodType<T>) {
  return (req: any, _res: any, next: any) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return next(r.error);
    req.body = r.data;
    next();
  };
}

router.get   ('/me',          requireAuth,                          userController.getProfile);
router.patch ('/me',          requireAuth, validate(updateSchema),  userController.updateProfile);
router.post  ('/me/password', requireAuth, validate(passwordSchema), userController.changePassword);

export default router;
