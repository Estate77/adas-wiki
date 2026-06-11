import type { Request, Response, NextFunction } from 'express';
import { interviewService } from './interview.service.js';

export const interviewController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.list({
        position:   req.query.position   as any,
        difficulty: req.query.difficulty as any,
        tag:        req.query.tag        as string,
        keyword:    req.query.keyword    as string,
        page:       Number(req.query.page ?? 1),
        pageSize:   Number(req.query.pageSize ?? 20),
      });
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ code: 'OK', data: await interviewService.detail(req.params.id) });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.create(req.body);
      res.status(201).json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.update(req.params.id, req.body);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.remove(req.params.id);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
};
