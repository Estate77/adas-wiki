/**
 * 消息 CRUD：通常在流式回答过程中按对写入
 */
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middlewares/error.js';

export const messageService = {
  /** 列出某会话的所有消息（需先校验所属） */
  async list(userId: string, conversationId: string) {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.userId !== userId) throw new HttpError(404, '会话不存在');
    return prisma.message.findMany({
      where:   { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { citations: true },
    });
  },

  /** 单条写入（流式结束时一次性落库） */
  async create(input: {
    conversationId: string;
    role:           'USER' | 'ASSISTANT' | 'SYSTEM';
    content:        string;
    tokensUsed?:    number;
    citations?:     { knowledgeId: string; snippet: string; score?: number }[];
  }) {
    return prisma.message.create({
      data: {
        conversationId: input.conversationId,
        role:           input.role,
        content:        input.content,
        tokensUsed:     input.tokensUsed,
        citations:      input.citations
          ? { create: input.citations.map((c) => ({
              knowledgeId: c.knowledgeId,
              snippet:     c.snippet,
              score:       c.score,
            })) }
          : undefined,
      },
      include: { citations: true },
    });
  },

  /** 删除某会话的全部消息 */
  async removeByConversation(userId: string, conversationId: string) {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.userId !== userId) throw new HttpError(404, '会话不存在');
    await prisma.message.deleteMany({ where: { conversationId } });
    return { ok: true };
  },
};
