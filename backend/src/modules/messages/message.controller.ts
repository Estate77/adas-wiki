import type { Request, Response, NextFunction } from 'express';
import { messageService } from './message.service.js';

export const messageController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await messageService.list(req.user!.userId, req.params.conversationId);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await messageService.create(req.body);
      res.status(201).json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
};
