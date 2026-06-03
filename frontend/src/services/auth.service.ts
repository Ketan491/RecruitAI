// src/services/auth.service.ts
import axios from 'axios';

import api from './api';

import type { AuthTokens, User } from '../types/api.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data as AuthTokens;
  },

  async register(payload: {
    name: string;
    email: string;
    company_name: string;
    password: string;
  }): Promise<{ user: User }> {
    const { data } = await api.post('/auth/register', payload);
    return data.data as { user: User };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(): Promise<string> {
    // FIX 6: use a plain axios call (not the api instance) to avoid the 401 interceptor
    // triggering another refresh — which would cause an infinite loop
    const { data } = await axios.post(
      `${BASE_URL}/api/v1/auth/refresh`,
      {},
      { withCredentials: true },
    );
    return data.data.access_token as string;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
};
