import { Router } from 'express';
import { z } from 'zod';
import { knowledgeController } from './knowledge.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

const createSchema = z.object({
  title:     z.string().min(1).max(200),
  content:   z.string().min(1),
  summary:   z.string().optional(),
  dimension: z.enum([
    'TECH_UNDERSTANDING',
    'PRODUCT_DEFINITION',
    'SAFETY_COMPLIANCE',
    'USER_EXPERIENCE',
    'BUSINESS_COMPETITION',
    'SCENARIO_SYSTEM_THINKING',
  ]),
  tags:      z.array(z.string()).optional(),
  source:    z.string().optional(),
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

// 列表 / 详情 公开可访问
router.get ('/',          knowledgeController.list);
router.get ('/:id',       knowledgeController.detail);

// 写入操作需登录（生产环境应再加 admin 校验）
router.post   ('/',       requireAuth, validate(createSchema), knowledgeController.create);
router.patch  ('/:id',    requireAuth, validate(updateSchema), knowledgeController.update);
router.delete ('/:id',    requireAuth,                          knowledgeController.remove);

export default router;
