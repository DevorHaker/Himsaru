import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
}

const TOKEN_KEY = 'himsaru_admin_token';

export function useAdmin() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.get('/auth/me', token)
        .then((res) => {
          if (res.data.role === 'ADMIN') {
            setState({ user: res.data, token, isLoading: false });
          } else {
            localStorage.removeItem(TOKEN_KEY);
            setState({ user: null, token: null, isLoading: false });
          }
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setState({ user: null, token: null, isLoading: false });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, ...user } = res.data;
    if (user.role !== 'ADMIN') {
      throw new Error('Access denied. Admin accounts only.');
    }
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, isLoading: false });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return { ...state, login, logout };
}
