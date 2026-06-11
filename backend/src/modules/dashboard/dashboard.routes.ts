import { Router } from 'express';
import { z } from 'zod';
import { dashboardController } from './dashboard.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

const mockSchema = z.object({
  score:    z.number().int().min(0).max(100),
  position: z.string().min(1),
});

function validate<T>(schema: z.ZodType<T>) {
  return (req: any, _res: any, next: any) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return next(r.error);
    req.body = r.data;
    next();
  };
}

router.get ('/overview',                    dashboardController.overview);
router.post('/mastered/:id',                dashboardController.markMastered);
router.post('/mock-score', validate(mockSchema), dashboardController.submitMockScore);

export default router;
