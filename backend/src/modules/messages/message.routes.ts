import { Router } from 'express';
import { z } from 'zod';
import { messageController } from './message.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  conversationId: z.string().min(1),
  role:           z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content:        z.string().min(1),
  tokensUsed:     z.number().int().optional(),
  citations:      z.array(z.object({
    knowledgeId: z.string(),
    snippet:     z.string(),
    score:       z.number().optional(),
  })).optional(),
});

function validate<T>(schema: z.ZodType<T>) {
  return (req: any, _res: any, next: any) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return next(r.error);
    req.body = r.data;
    next();
  };
}

// 注意：挂在 /api/messages 下的路径
router.get   ('/conversation/:conversationId', messageController.list);
router.post  ('/',                              validate(createSchema), messageController.create);

export default router;
