import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ code: 'OK', data: result });
    } catch (e) {
      next(e);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json({ code: 'OK', data: result });
    } catch (e) {
      next(e);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId);
      res.json({ code: 'OK', data: user });
    } catch (e) {
      next(e);
    }
  },
};
