import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';

export const userController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ code: 'OK', data: await userService.getProfile(req.user!.userId) });
    } catch (e) { next(e); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateProfile(req.user!.userId, req.body);
      res.json({ code: 'OK', data });
    } catch (e) { next(e); }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
      res.json({ code: 'OK', message: '密码修改成功' });
    } catch (e) { next(e); }
  },
};
