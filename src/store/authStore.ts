import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  role: 'SUPER_ADMIN' | 'MODERATEUR' | 'AGENT' | 'PROPRIETAIRE' | 'CHERCHEUR';
  telephone: string;
  is_subscribed: boolean;
}

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: User | null;
  login: (tokens: { access: string; refresh: string }, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      user: null,
      login: (tokens, user) =>
        set({
          access_token: tokens.access,
          refresh_token: tokens.refresh,
          user,
        }),
      logout: () =>
        set({
          access_token: null,
          refresh_token: null,
          user: null,
        }),
      isAuthenticated: () => !!get().access_token,
    }),
    {
      name: 'ndangira-auth-storage', // key in localStorage
    }
  )
);
