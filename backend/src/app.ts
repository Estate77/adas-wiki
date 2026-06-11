/**
 * Express 应用装配（不含 listen，便于测试）
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import authRoutes       from './modules/auth/auth.routes.js';
import userRoutes       from './modules/users/user.routes.js';
import conversationRoutes from './modules/conversations/conversation.routes.js';
import messageRoutes    from './modules/messages/message.routes.js';
import knowledgeRoutes  from './modules/knowledge/knowledge.routes.js';
import interviewRoutes  from './modules/interview/interview.routes.js';
import dashboardRoutes  from './modules/dashboard/dashboard.routes.js';

export function createApp() {
  const app = express();

  // 基础中间件
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','), credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));
  app.use(apiLimiter);

  // 健康检查
  app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  // 业务路由
  app.use('/api/auth',          authRoutes);
  app.use('/api/users',         userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/messages',      messageRoutes);
  app.use('/api/knowledge',     knowledgeRoutes);
  app.use('/api/interview',     interviewRoutes);
  app.use('/api/dashboard',     dashboardRoutes);

  // 错误处理
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
