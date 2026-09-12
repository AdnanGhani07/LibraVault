'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/types';
import { api, ApiResponseError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('libravault_token');
    const savedUser = localStorage.getItem('libravault_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('libravault_token');
        localStorage.removeItem('libravault_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    const loggedInUser: User = {
      id: res.id,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    };

    localStorage.setItem('libravault_token', res.accessToken);
    localStorage.setItem('libravault_user', JSON.stringify(loggedInUser));

    setToken(res.accessToken);
    setUser(loggedInUser);

    // Smart role-based redirect
    if (res.role === 'ROLE_ADMIN') {
      router.push('/admin/inventory');
    } else if (res.role === 'ROLE_STAFF') {
      router.push('/staff/checkout');
    } else {
      router.push('/member/bookshelf');
    }
  };

  const register = async (userData: { email: string; password: string; fullName: string }) => {
    const res = await api.auth.register(userData);
    const registeredUser: User = {
      id: res.id,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    };

    localStorage.setItem('libravault_token', res.accessToken);
    localStorage.setItem('libravault_user', JSON.stringify(registeredUser));

    setToken(res.accessToken);
    setUser(registeredUser);
    router.push('/member/bookshelf');
  };

  const logout = () => {
    localStorage.removeItem('libravault_token');
    localStorage.removeItem('libravault_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
