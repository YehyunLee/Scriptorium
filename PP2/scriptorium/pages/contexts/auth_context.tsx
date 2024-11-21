// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { User, AuthContextType } from '../../types/auth';


export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  let refreshPromise: Promise<string> | null = null;

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/auth/refresh_token', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Refresh failed');
      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      throw error;
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`/api${url}`, { ...options, headers });

      if (response.status === 401) {
        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken();
          }
          const newToken = await refreshPromise;
          refreshPromise = null;

          localStorage.setItem('accessToken', newToken);
          headers.Authorization = `Bearer ${newToken}`;
          return fetch(`/api${url}`, { ...options, headers });
        } catch (error) {
          router.push('/login');
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const api = {
    get: (url: string, options?: RequestInit) => 
      fetchWithAuth(url, { ...options, method: 'GET' }),
    post: (url: string, data?: any) =>
      fetchWithAuth(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url: string, data?: any) =>
      fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url: string) =>
      fetchWithAuth(url, { method: 'DELETE' }),
  };

  const handleLogin = async (token: string) => {
    try {
      localStorage.setItem('accessToken', token);
      setIsAuthenticated(true);
      
      const response = await api.get('/auth/profile');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error setting up auth:', error);
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      handleLogin(token);
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        user,
        login: handleLogin,
        logout: handleLogout,
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);