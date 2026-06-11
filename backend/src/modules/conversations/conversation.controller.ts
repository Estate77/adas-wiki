import type { Request, Response, NextFunction } from 'express';
import { conversationService } from './conversation.service.js';

export const conversationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ code: 'OK', data: await conversationService.list(req.user!.userId) });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await conversationService.create(req.user!.userId, req.body?.title);
      res.status(201).json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async rename(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await conversationService.rename(req.user!.userId, req.params.id, req.body.title);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await conversationService.remove(req.user!.userId, req.params.id);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
};
