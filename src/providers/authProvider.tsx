// providers/authProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType, SignupCredentials } from '@/types/auth.types';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { gsApi, GSUser } from '@/lib/api/google-sheets-api-client';
import { DEV_CONFIG, logDevMode } from '@/config/dev';

// Backend type for auth
type AuthBackend = 'main' | 'sheets' | 'none';

// Extended context with backend info
interface ExtendedAuthContextType extends AuthContextType {
  authBackend: AuthBackend;
  usingFallback: boolean;
}

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

// Helper to convert GSUser -> User (domain model)
// Only map fields that exist on GSUser; add sensible defaults where needed.
function gsUserToUser(gsUser: GSUser): User {
  return {
    id: gsUser.id,
    username: gsUser.username,
    email: gsUser.email,
    name: gsUser.name,
    role: (gsUser.role as 'user' | 'admin') || 'user',
    preferences: undefined, // GSUser doesn't include preferences; keep undefined
    lastLogin: undefined, // not provided by GSUser
    isActive: true, // default true (GSUser has no isActive)
    createdAt: gsUser.createdAt ? new Date(gsUser.createdAt) : new Date(),
    updatedAt: gsUser.updatedAt ? new Date(gsUser.updatedAt) : new Date(),
    portfolios: undefined,
  };
}

// Helper to convert Partial<User> -> Partial<GSUser>
// Only map fields that GSUser accepts (id, email, username, name, role, createdAt, updatedAt).
function userUpdatesToGsUserUpdates(updates: Partial<User>): Partial<GSUser> {
  const out: Partial<GSUser> = {};

  if (updates.id !== undefined) out.id = updates.id;
  if (updates.email !== undefined) out.email = updates.email;
  if (updates.username !== undefined) out.username = updates.username;
  if (updates.name !== undefined) out.name = updates.name;
  if (updates.role !== undefined) out.role = updates.role as string;

  // Convert Dates to ISO strings if present
  if (updates.createdAt instanceof Date) {
    out.createdAt = updates.createdAt.toISOString();
  } else if (typeof updates.createdAt === 'string') {
    out.createdAt = updates.createdAt;
  }

  if (updates.updatedAt instanceof Date) {
    out.updatedAt = updates.updatedAt.toISOString();
  } else if (typeof updates.updatedAt === 'string') {
    out.updatedAt = updates.updatedAt;
  }

  return out;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authBackend, setAuthBackend] = useState<AuthBackend>('none');
  const router = useRouter();

  const isAuthenticated = !!user;
  const usingFallback = authBackend === 'sheets';

  // Determine which backend to use
  const determineBackend = useCallback(async (): Promise<AuthBackend> => {
    // Try main server first
    try {
      const result = await api.health.testConnection();
      if (result.connected) {
        console.log('[Auth] Using main server');
        return 'main';
      }
    } catch (error) {
      console.log('[Auth] Main server unavailable');
    }

    // Try Google Sheets
    try {
      const gsResult = await gsApi.health.testConnection();
      if (gsResult.connected) {
        console.log('[Auth] Using Google Sheets fallback');
        return 'sheets';
      }
    } catch (error) {
      console.log('[Auth] Google Sheets also unavailable');
    }

    return 'none';
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // 🔓 BYPASS AUTH IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Using mock user data', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        setAuthBackend('main');
        setLoading(false);
        return;
      }

      // Check if we have a token
      const token = localStorage.getItem('auth-token') || localStorage.getItem('gs-auth-token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Determine which backend to use
      const backend = await determineBackend();
      setAuthBackend(backend);

      if (backend === 'none') {
        console.warn('[Auth] No backend available');
        setUser(null);
        setLoading(false);
        return;
      }

      // Get current user from appropriate backend
      if (backend === 'sheets') {
        try {
          const gsUser = await gsApi.auth.getCurrentUser();
          setUser(gsUserToUser(gsUser));
        } catch (error) {
          console.error('[Auth] Failed to get user from Google Sheets:', error);
          localStorage.removeItem('gs-auth-token');
          localStorage.removeItem('auth-token');
          setUser(null);
        }
      } else {
        try {
          const currentUser = await api.auth.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('[Auth] Failed to get user from main server:', error);
          localStorage.removeItem('auth-token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('gs-auth-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [determineBackend]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      // 🔓 MOCK LOGIN IN DEV MODE
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock login successful', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        setAuthBackend('main');

        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
        return;
      }

      // Determine backend if not set
      let backend = authBackend;
      if (backend === 'none') {
        backend = await determineBackend();
        setAuthBackend(backend);
      }

      if (backend === 'none') {
        throw new Error('No backend available. Please try again later.');
      }

      if (backend === 'sheets') {
        // Use Google Sheets
        const response = await gsApi.auth.login({
          usernameOrEmail,
          password
        });

        if (response.user) {
          setUser(gsUserToUser(response.user));

          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
        }
      } else {
        // Use main server
        const response = await api.auth.login({
          email: usernameOrEmail,
          password
        });

        if (response.user) {
          setUser(response.user);

          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
        }
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
        setAuthBackend('main');
        router.push('/dashboard');
        return;
      }

      // Determine backend if not set
      let backend = authBackend;
      if (backend === 'none') {
        backend = await determineBackend();
        setAuthBackend(backend);
      }

      if (backend === 'none') {
        throw new Error('No backend available. Please try again later.');
      }

      if (backend === 'sheets') {
        // Use Google Sheets
        const response = await gsApi.auth.signup({
          email: credentials.email,
          password: credentials.password,
          username: credentials.username,
          name: credentials.name,
          role: credentials.role
        });

        if (response.user) {
          setUser(gsUserToUser(response.user));
          router.push('/dashboard');
        }
      } else {
        // Use main server
        const response = await api.auth.signup(credentials);

        if (response.user) {
          setUser(response.user);
          router.push('/dashboard');
        }
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

      if (authBackend === 'sheets') {
        await gsApi.auth.logout();
      } else {
        await api.auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all tokens
      localStorage.removeItem('auth-token');
      localStorage.removeItem('gs-auth-token');
      setUser(null);
      setAuthBackend('none');
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

      if (authBackend === 'sheets') {
        // Map domain Partial<User> -> transport Partial<GSUser>
        const gsUpdates = userUpdatesToGsUserUpdates(updates);
        const updatedGsUser = await gsApi.auth.updateProfile(gsUpdates);
        setUser(gsUserToUser(updatedGsUser));
      } else {
        const updatedUser = await api.auth.updateProfile(updates);
        setUser(updatedUser);
      }
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
      updateUser,
      authBackend,
      usingFallback
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

// NEW: Hook to check which auth backend is being used
export const useAuthBackend = () => {
  const { authBackend, usingFallback } = useAuth();
  return { authBackend, usingFallback };
};
