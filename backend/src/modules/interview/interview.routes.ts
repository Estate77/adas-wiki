import { Router } from 'express';
import { z } from 'zod';
import { interviewController } from './interview.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

const createSchema = z.object({
  position:    z.enum([
    'PRODUCT_MANAGER', 'ALGO_ENGINEER', 'PERCEPTION_ENGINEER',
    'PLANNING_ENGINEER', 'TEST_ENGINEER', 'SAFETY_ENGINEER',
    'SALES_SOLUTION', 'OTHER',
  ]),
  difficulty:  z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  stem:        z.string().min(1),
  intent:      z.string().min(1),
  answer:      z.string().min(1),
  tags:        z.array(z.string()).optional(),
  relatedKBId: z.string().optional(),
});

const updateSchema = createSchema.partial();

function validate<T>(schema: z.ZodType<T>) {
  return (req: any, _res: any, next: any) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return next(r.error);
    req.body = r.data;
    next();
  };
}

router.get   ('/',       interviewController.list);
router.get   ('/:id',    interviewController.detail);
router.post  ('/',       requireAuth, validate(createSchema), interviewController.create);
router.patch ('/:id',    requireAuth, validate(updateSchema), interviewController.update);
router.delete('/:id',    requireAuth,                          interviewController.remove);

export default router;
