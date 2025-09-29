'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const { getUserProfile } = await import('@/services/apiServics');
      const response = await getUserProfile();
      
      if (response.success) {
        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatarUrl: response.user.avatarUrl || undefined,
          created_at: response.user.created_at
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { loginUser } = await import('@/services/apiServics');
      const data = await loginUser(email, password);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      router.push('/');
    } catch (error: any) {
      console.error('AuthContext: Erro no login:', error);

      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error?.response?.status === 401) {
        throw new Error('Email ou senha incorretos');
      } else if (error?.response?.status === 500) {
        throw new Error('Erro interno do servidor. Tente novamente.');
      } else if (error?.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro desconhecido ao fazer login');
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
    const { registerUser } = await import('@/services/apiServics');
      await registerUser({ name, email, password });
      
      await login(email, password);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}