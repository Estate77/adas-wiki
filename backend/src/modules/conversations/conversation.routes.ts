import { Router } from 'express';
import { z } from 'zod';
import { conversationController } from './conversation.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

const createSchema = z.object({ title: z.string().max(60).optional() });
const renameSchema = z.object({ title: z.string().min(1).max(60) });

function validate<T>(schema: z.ZodType<T>) {
  return (req: any, _res: any, next: any) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return next(r.error);
    req.body = r.data;
    next();
  };
}

router.use(requireAuth);

router.get   ('/',          conversationController.list);
router.post  ('/',          validate(createSchema),  conversationController.create);
router.patch ('/:id',       validate(renameSchema),  (req, res, next) =>
  conversationController.rename(req, res, next));
router.delete('/:id',       conversationController.remove);

export default router;
