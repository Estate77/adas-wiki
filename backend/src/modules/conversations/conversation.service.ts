/**
 * 会话 CRUD
 */
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middlewares/error.js';

export const conversationService = {
  /** 列出当前用户的会话 */
  async list(userId: string) {
    return prisma.conversation.findMany({
      where:   { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  },

  /** 创建会话 */
  async create(userId: string, title?: string) {
    const conv = await prisma.conversation.create({
      data: { userId, title: title?.slice(0, 60) || '新会话' },
    });
    // 累加提问数
    await prisma.userProgress.upsert({
      where:  { userId },
      update: { totalQuestions: { increment: 1 } },
      create: { userId, totalQuestions: 1, masteredCount: 0 },
    });
    return conv;
  },

  /** 重命名 */
  async rename(userId: string, id: string, title: string) {
    return prisma.conversation.update({
      where: { id },
      data:  { title: title.slice(0, 60) },
    }).catch(() => { throw new HttpError(404, '会话不存在'); });
    // 权限校验
    // const conv = await ...; if (conv.userId !== userId) throw 403;
  },

  /** 删除 */
  async remove(userId: string, id: string) {
    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv || conv.userId !== userId) throw new HttpError(404, '会话不存在');
    await prisma.conversation.delete({ where: { id } });
    return { ok: true };
  },
};
