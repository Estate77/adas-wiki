/**
 * 用户业务：个人资料、修改密码、仪表盘统计
 */
import { prisma } from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { HttpError } from '../../middlewares/error.js';

export const userService = {
  /** 获取个人资料 */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { progress: true },
    });
    if (!user) throw new HttpError(404, '用户不存在');
    const { passwordHash: _omit, ...rest } = user;
    return rest;
  },

  /** 更新个人资料 */
  async updateProfile(userId: string, data: { username?: string; bio?: string; avatar?: string }) {
    if (data.username) {
      const conflict = await prisma.user.findFirst({
        where: { username: data.username, NOT: { id: userId } },
      });
      if (conflict) throw new HttpError(409, '用户名已被占用');
    }
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, username: true, role: true, avatar: true, bio: true, createdAt: true },
    });
  },

  /** 修改密码 */
  async changePassword(userId: string, oldPwd: string, newPwd: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, '用户不存在');
    const ok = await comparePassword(oldPwd, user.passwordHash);
    if (!ok) throw new HttpError(400, '原密码错误');
    if (newPwd.length < 6) throw new HttpError(400, '新密码至少 6 位');

    await prisma.user.update({
      where: { id: userId },
      data:  { passwordHash: await hashPassword(newPwd) },
    });
    return { ok: true };
  },
};
