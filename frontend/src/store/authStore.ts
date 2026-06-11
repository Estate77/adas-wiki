import { create } from 'zustand';
import { authService, type User } from '@/services/auth.service';

const TOKEN_KEY = 'adas_token';

interface AuthState {
  user:      User | null;
  token:     string | null;
  loading:   boolean;
  hydrated:  boolean;  // 是否完成启动期鉴权

  // 行为
  bootstrap:        () => Promise<void>;
  login:            (email: string, password: string) => Promise<void>;
  register:         (email: string, username: string, password: string) => Promise<void>;
  logout:           () => void;
  updateProfile:    (payload: Partial<Pick<User, 'username' | 'bio' | 'avatar'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:     null,
  token:    null,
  loading:  false,
  hydrated: false,

  bootstrap: async () => {
    if (get().hydrated) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ hydrated: true });
      return;
    }
    set({ token });
    try {
      const user = await authService.me();
      set({ user, hydrated: true });
    } catch {
      // token 失效
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, hydrated: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { token, user } = await authService.login({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (email, username, password) => {
    set({ loading: true });
    try {
      const { token, user } = await authService.register({ email, username, password });
      localStorage.setItem(TOKEN_KEY, token);
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },

  updateProfile: async (payload) => {
    const user = await authService.updateProfile(payload);
    set({ user });
  },
}));
