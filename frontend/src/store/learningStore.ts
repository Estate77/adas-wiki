import { create } from 'zustand';

/** 收藏类型 */
export type FavoriteKind = 'QNA' | 'KNOWLEDGE' | 'INTERVIEW' | 'SCENARIO' | 'COMPETITOR';

export interface Favorite {
  id: string;
  kind: FavoriteKind;
  title: string;
  snippet?: string;
  /** 跳转链接（站内或外部） */
  href: string;
  /** 关联的维度（可选） */
  dimension?: string;
  createdAt: number;
}

/** 面试准备清单项 */
export interface PrepItem {
  id: string;
  category: 'TECH' | 'PRODUCT' | 'TEST' | 'SAFETY' | 'GENERAL';
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  note?: string;
  createdAt: number;
  updatedAt: number;
}

interface LearningState {
  favorites: Favorite[];
  prepList: PrepItem[];

  // ============ 持久化 ============
  bootstrap: () => void;

  // ============ Favorites ============
  addFavorite: (fav: Omit<Favorite, 'id' | 'createdAt'>) => void;
  removeFavorite: (id: string) => void;
  isFavorited: (href: string) => boolean;
  toggleFavorite: (fav: Omit<Favorite, 'id' | 'createdAt'>) => boolean;

  // ============ Prep List ============
  addPrep: (item: Omit<PrepItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrep: (id: string, patch: Partial<PrepItem>) => void;
  removePrep: (id: string) => void;
  togglePrepStatus: (id: string) => void;
  clearDone: () => void;
}

const STORAGE_KEY = 'adas_learning_v1';

interface PersistedShape {
  favorites: Favorite[];
  prepList: PrepItem[];
}

function loadFromStorage(): PersistedShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { favorites: [], prepList: [] };
    return JSON.parse(raw) as PersistedShape;
  } catch {
    return { favorites: [], prepList: [] };
  }
}

function saveToStorage(state: PersistedShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 忽略 */
  }
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/** 默认面试准备清单（首次使用时插入） */
const DEFAULT_PREP: Omit<PrepItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { category: 'GENERAL', title: '通读 ISO 26262 与 SOTIF 标准大纲', status: 'TODO' },
  { category: 'TECH',    title: '复述 BEV / Occupancy / 端到端的差异与联系', status: 'TODO' },
  { category: 'TECH',    title: '理解 LiDAR / Camera / Radar 的融合策略', status: 'TODO' },
  { category: 'PRODUCT', title: '画一张"场景→功能→ODD"的产品分解图', status: 'TODO' },
  { category: 'TEST',    title: '设计 3 个长尾场景的测试用例', status: 'TODO' },
  { category: 'SAFETY',  title: '解释 L2 / L3 / L4 在事故责任上的差异', status: 'TODO' },
];

export const useLearningStore = create<LearningState>((set, get) => ({
  favorites: [],
  prepList: [],

  bootstrap: () => {
    const persisted = loadFromStorage();
    if (persisted.prepList.length === 0) {
      // 首次进入：注入默认准备清单
      const now = Date.now();
      const prepList: PrepItem[] = DEFAULT_PREP.map((p) => ({
        ...p,
        id: uid(),
        createdAt: now,
        updatedAt: now,
      }));
      const next = { favorites: persisted.favorites, prepList };
      saveToStorage(next);
      set(next);
    } else {
      set(persisted);
    }
  },

  addFavorite: (fav) => {
    const item: Favorite = { ...fav, id: uid(), createdAt: Date.now() };
    set((s) => {
      const next = { ...s, favorites: [item, ...s.favorites] };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },

  removeFavorite: (id) => {
    set((s) => {
      const next = { ...s, favorites: s.favorites.filter((f) => f.id !== id) };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },

  isFavorited: (href) => get().favorites.some((f) => f.href === href),

  toggleFavorite: (fav) => {
    const existing = get().favorites.find((f) => f.href === fav.href);
    if (existing) {
      set((s) => {
        const next = { ...s, favorites: s.favorites.filter((f) => f.id !== existing.id) };
        saveToStorage({ favorites: next.favorites, prepList: next.prepList });
        return next;
      });
      return false;
    }
    const item: Favorite = { ...fav, id: uid(), createdAt: Date.now() };
    set((s) => {
      const next = { ...s, favorites: [item, ...s.favorites] };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
    return true;
  },

  addPrep: (item) => {
    const now = Date.now();
    const newItem: PrepItem = { ...item, id: uid(), createdAt: now, updatedAt: now };
    set((s) => {
      const next = { ...s, prepList: [newItem, ...s.prepList] };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },

  updatePrep: (id, patch) => {
    set((s) => {
      const next = {
        ...s,
        prepList: s.prepList.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
        ),
      };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },

  removePrep: (id) => {
    set((s) => {
      const next = { ...s, prepList: s.prepList.filter((p) => p.id !== id) };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },

  togglePrepStatus: (id) => {
    set((s) => {
      const next = {
        ...s,
        prepList: s.prepList.map((p) => {
          if (p.id !== id) return p;
          const ns: PrepItem['status'] =
            p.status === 'TODO' ? 'IN_PROGRESS' : p.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
          return { ...p, status: ns, updatedAt: Date.now() };
        }),
      };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },

  clearDone: () => {
    set((s) => {
      const next = { ...s, prepList: s.prepList.filter((p) => p.status !== 'DONE') };
      saveToStorage({ favorites: next.favorites, prepList: next.prepList });
      return next;
    });
  },
}));
