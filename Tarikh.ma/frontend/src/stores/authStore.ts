import { create } from 'zustand';
import { authApi } from '@/api/client';

export type User = { id: number; email: string; name: string; role: string };

const TOKEN_KEY = 'tarikh_token';

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return set({ user: null });
    try {
      const user = await authApi.user();
      set({ token, user });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null });
    }
  },
}));
