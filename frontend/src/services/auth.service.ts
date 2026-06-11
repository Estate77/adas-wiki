import { http } from './http';

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
    const r = await http.post<{ data: AuthResult }>('/auth/register', payload);
    return r.data.data;
  },
  async login(payload: { email: string; password: string }): Promise<AuthResult> {
    const r = await http.post<{ data: AuthResult }>('/auth/login', payload);
    return r.data.data;
  },
  async me(): Promise<User> {
    const r = await http.get<{ data: User }>('/auth/me');
    return r.data.data;
  },
  async updateProfile(payload: Partial<Pick<User, 'username' | 'bio' | 'avatar'>>): Promise<User> {
    const r = await http.patch<{ data: User }>('/users/me', payload);
    return r.data.data;
  },
  async changePassword(payload: { oldPassword: string; newPassword: string }) {
    await http.post('/users/me/password', payload);
  },
};
