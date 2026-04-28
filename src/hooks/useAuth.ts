import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'DISTRIBUTOR';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const TOKEN_KEY = 'himsaru_auth_token';

export function useAuthLogic() {
  const [state, setState] = useState<AuthState>({
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
          setState({ user: res.data, token, isLoading: false });
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
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, isLoading: false });
    return user;
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await api.post('/auth/register', data);
    const { token, ...user } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, isLoading: false });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return { ...state, login, register, logout };
}

// Optional: Context if we want global auth state easily accessible everywhere
const AuthContext = createContext<ReturnType<typeof useAuthLogic> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthLogic();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback if not wrapped in provider (though best to wrap in App)
    console.warn("useAuth used outside of AuthProvider, falling back to local hook state");
    return useAuthLogic();
  }
  return ctx;
}
