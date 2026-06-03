// src/store/authStore.ts
import { create } from 'zustand';

import type { User } from '../types/api.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // FIX 8: start as true — app is determining auth state on load
  // useAuth.ts will always set it to false once it resolves (success or failure)
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setToken: (accessToken) => set({ accessToken }),

  // clearAuth sets isLoading: false — this is critical for the login page to render
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
