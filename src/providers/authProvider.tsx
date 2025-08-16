// providers/authProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType, SignupCredentials } from '@/types/auth.types';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { DEV_CONFIG, logDevMode } from '@/config/dev';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Compute isAuthenticated based on user state
  const isAuthenticated = !!user;

  const checkAuth = useCallback(async () => {
    try {
      // 🔓 BYPASS AUTH IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Using mock user data', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        setLoading(false);
        return;
      }

      // Check if we have a token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Use the API client to get current user
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      // If auth check fails, clear the token
      localStorage.removeItem('auth-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      // 🔓 MOCK LOGIN IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock login successful', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        
        // Redirect as normal
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
        return;
      }

      // Use the API client which will automatically store the token
      const response = await api.auth.login({
        email: usernameOrEmail, // The API client will convert this to usernameOrEmail
        password
      });

      if (response.user) {
        setUser(response.user);
        
        // Redirect as before
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      // 🔓 MOCK SIGNUP IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock signup successful', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        router.push('/dashboard');
        return;
      }

      // Use the API client which will automatically store the token
      const response = await api.auth.signup(credentials);
      
      if (response.user) {
        setUser(response.user);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 🔓 MOCK LOGOUT IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock logout', 'AuthProvider');
        setUser(null);
        router.push('/');
        return;
      }

      // Use the API client which will clear the token
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      // 🔓 MOCK UPDATE IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock user update', 'AuthProvider');
        setUser(prev => prev ? { ...prev, ...updates } : null);
        return;
      }

      const updatedUser = await api.auth.updateProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated,
      login, 
      logout, 
      loading, 
      signup, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};