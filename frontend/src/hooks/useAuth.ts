// src/hooks/useAuth.ts
import { useEffect, useRef } from 'react';

import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  // FIX 7: use a ref to prevent double-fire in React Strict Mode
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (accessToken) {
      // Already have a token in memory — no need to refresh
      setLoading(false);
      return;
    }

    // Try silent refresh on app load (httpOnly cookie may still be valid)
    const tryRefresh = async () => {
      try {
        const token = await authService.refreshToken();
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAuth(
          {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            company_name: payload.company_name,
            created_at: payload.created_at,
          },
          token,
        );
      } catch {
        // No valid refresh cookie — user must log in
        // FIX 7b: always call clearAuth so isLoading becomes false
        // Without this, isLoading stays true and the app hangs on a spinner forever
        clearAuth();
      }
    };

    void tryRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const tokens = await authService.login(email, password);
    setAuth(tokens.user, tokens.access_token);
    return tokens;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return { user, isAuthenticated, isLoading, login, logout };
};
