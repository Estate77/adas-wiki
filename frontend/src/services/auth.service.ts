import {
  createDemoId,
  getCurrentUserRecord,
  listUserRecords,
  makeToken,
  sanitizeUser,
  saveUserRecords,
  type DemoUserRecord,
} from './demo-db';

const TOKEN_KEY = 'adas_token';

export interface User {
  id:        string;
  email:     string;
  username:  string;
  role:      'USER' | 'ADMIN' | 'EXPERT' | string;
  avatar:    string | null;
  bio:       string | null;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user:  User;
}

export const authService = {
  async register(payload: { email: string; username: string; password: string }): Promise<AuthResult> {
    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim();
    const password = payload.password;

    if (!email || !username || !password) {
      throw new Error('请填写完整信息');
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 位');
    }

    const users = listUserRecords();
    const exists = users.find((user) => user.email === email || user.username === username);
    if (exists) {
      throw new Error('邮箱或用户名已存在');
    }

    const created: DemoUserRecord = {
      id: createDemoId('user'),
      email,
      username,
      password,
      role: 'USER',
      avatar: null,
      bio: '纯前端 Demo 用户，数据仅保存在当前浏览器。',
      createdAt: new Date().toISOString(),
    };

    users.push(created);
    saveUserRecords(users);

    return {
      token: makeToken(created.id),
      user: sanitizeUser(created),
    };
  },
  async login(payload: { email: string; password: string }): Promise<AuthResult> {
    const email = payload.email.trim().toLowerCase();
    const user = listUserRecords().find((item) => item.email === email);
    if (!user || user.password !== payload.password) {
      throw new Error('邮箱或密码错误');
    }

    return {
      token: makeToken(user.id),
      user: sanitizeUser(user),
    };
  },
  async me(): Promise<User> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) throw new Error('未登录');

    const user = getCurrentUserRecord();
    if (!user) throw new Error('登录态已失效');
    return sanitizeUser(user);
  },
  async updateProfile(payload: Partial<Pick<User, 'username' | 'bio' | 'avatar'>>): Promise<User> {
    const current = getCurrentUserRecord();
    if (!current) throw new Error('未登录');

    const users = listUserRecords();
    const nextUsername = payload.username?.trim();

    if (nextUsername) {
      const duplicated = users.find((user) => user.id !== current.id && user.username === nextUsername);
      if (duplicated) {
        throw new Error('用户名已存在');
      }
    }

    const updated = users.map((user) =>
      user.id === current.id
        ? {
            ...user,
            username: nextUsername ?? user.username,
            bio: payload.bio === undefined ? user.bio : payload.bio,
            avatar: payload.avatar === undefined ? user.avatar : payload.avatar,
          }
        : user
    );

    saveUserRecords(updated);
    return sanitizeUser(updated.find((user) => user.id === current.id)!);
  },
  async changePassword(payload: { oldPassword: string; newPassword: string }) {
    const current = getCurrentUserRecord();
    if (!current) throw new Error('未登录');
    if (payload.newPassword.length < 6) throw new Error('新密码至少 6 位');
    if (current.password !== payload.oldPassword) throw new Error('当前密码不正确');

    const users = listUserRecords().map((user) =>
      user.id === current.id ? { ...user, password: payload.newPassword } : user
    );
    saveUserRecords(users);
  },
};
