import type { Request, Response, NextFunction } from 'express';
import { knowledgeService } from './knowledge.service.js';

export const knowledgeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await knowledgeService.list({
        dimension: req.query.dimension as any,
        keyword:   req.query.keyword   as string,
        page:      Number(req.query.page ?? 1),
        pageSize:  Number(req.query.pageSize ?? 20),
      });
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ code: 'OK', data: await knowledgeService.detail(req.params.id) });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await knowledgeService.create(req.body);
      res.status(201).json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await knowledgeService.update(req.params.id, req.body);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await knowledgeService.remove(req.params.id);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
};
