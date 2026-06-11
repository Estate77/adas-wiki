import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview(req.user!.userId);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async markMastered(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.markMastered(req.user!.userId, req.params.id);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
  async submitMockScore(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.submitMockScore(
        req.user!.userId,
        Number(req.body.score),
        req.body.position,
      );
      res.status(201).json({ code: 'OK', data });
    } catch (e) { next(e); }
  },
};
