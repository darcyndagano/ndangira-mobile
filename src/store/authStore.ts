import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'MODERATEUR' | 'AGENT' | 'PROPRIETAIRE' | 'CHERCHEUR';
  telephone: string;
  whatsapp?: string;
  is_subscribed: boolean;
}

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: User | null;
  login: (tokens: { access: string; refresh: string }, user: User) => void;
  setTokens: (tokens: { access: string; refresh?: string }) => void;
  setSubscribed: (value: boolean) => void;
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
      setTokens: (tokens) =>
        set((state) => ({
          access_token: tokens.access,
          refresh_token: tokens.refresh ?? state.refresh_token,
        })),
      setSubscribed: (value) =>
        set((state) =>
          state.user ? { user: { ...state.user, is_subscribed: value } } : {}
        ),
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
