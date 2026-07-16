'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('buspawa_token');
    const savedUser = localStorage.getItem('buspawa_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { user: u, token: t } = res.data;
    localStorage.setItem('buspawa_token', t);
    localStorage.setItem('buspawa_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; role: string; phone?: string }) => {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    const { user: u, token: t } = res.data;
    localStorage.setItem('buspawa_token', t);
    localStorage.setItem('buspawa_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('buspawa_token');
    localStorage.removeItem('buspawa_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
