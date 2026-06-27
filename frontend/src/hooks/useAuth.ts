import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('trustcart_token');
    if (token && !user) {
      authApi.getProfile()
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data) {
      login(res.data.user, res.data.token);
    }
    return res;
  };

  const handleRegister = async (email: string, password: string, name?: string) => {
    const res = await authApi.register({ email, password, name });
    if (res.data) {
      login(res.data.user, res.data.token);
    }
    return res;
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
