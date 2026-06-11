/**
 * 鉴权业务逻辑
 */
import { prisma } from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { HttpError } from '../../middlewares/error.js';

export interface AuthResult {
  token: string;
  user: {
    id:        string;
    email:     string;
    username:  string;
    role:      string;
    avatar:    string | null;
    bio:       string | null;
    createdAt: Date;
  };
}

export const authService = {
  /** 注册 */
  async register(input: { email: string; username: string; password: string }): Promise<AuthResult> {
    const { email, username, password } = input;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new HttpError(409, '邮箱或用户名已被注册', 'USER_EXISTS');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        // 注册时自动初始化 progress
        progress: { create: { totalQuestions: 0, masteredCount: 0 } },
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: this.toSafeUser(user) };
  },

  /** 登录 */
  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const { email, password } = input;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, '邮箱或密码错误', 'INVALID_CREDENTIALS');

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new HttpError(401, '邮箱或密码错误', 'INVALID_CREDENTIALS');

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: this.toSafeUser(user) };
  },

  /** 获取当前用户 */
  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { progress: true },
    });
    if (!user) throw new HttpError(404, '用户不存在', 'USER_NOT_FOUND');
    return this.toSafeUser(user);
  },

  toSafeUser(user: any) {
    return {
      id:        user.id,
      email:     user.email,
      username:  user.username,
      role:      user.role,
      avatar:    user.avatar,
      bio:       user.bio,
      createdAt: user.createdAt,
    };
  },
};
