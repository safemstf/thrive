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
function gsUserToUser(gsUser: GSUser): User {
  return {
    id: gsUser.id,
    username: gsUser.username,
    email: gsUser.email,
    name: gsUser.name,
    role: (gsUser.role as 'user' | 'admin') || 'user',
    preferences: undefined,
    lastLogin: undefined,
    isActive: true,
    createdAt: gsUser.createdAt ? new Date(gsUser.createdAt) : new Date(),
    updatedAt: gsUser.updatedAt ? new Date(gsUser.updatedAt) : new Date(),
    portfolios: undefined,
  };
}

// Helper to convert Partial<User> -> Partial<GSUser>
function userUpdatesToGsUserUpdates(updates: Partial<User>): Partial<GSUser> {
  const out: Partial<GSUser> = {};

  if (updates.id !== undefined) out.id = updates.id;
  if (updates.email !== undefined) out.email = updates.email;
  if (updates.username !== undefined) out.username = updates.username;
  if (updates.name !== undefined) out.name = updates.name;
  if (updates.role !== undefined) out.role = updates.role as string;

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
    try {
      const result = await api.health.testConnection();
      if (result.connected) {
        console.log('[Auth] Using main server');
        return 'main';
      }
    } catch (error) {
      console.log('[Auth] Main server unavailable');
    }

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

  // verifyTokenAndLoadUser: tries GS verify first then main server verify (if present)
  const verifyTokenAndLoadUser = useCallback(async (token: string): Promise<AuthBackend | 'none'> => {
    if (!token) return 'none';

    // Try Google Sheets verification first
    try {
      if (!token) throw new Error('No token provided for GS verify');
      const gsUser = await gsApi.auth.verifyToken(token);
      if (gsUser) {
        console.debug('[Auth] Token verified by Google Sheets');
        setUser(gsUserToUser(gsUser));
        setAuthBackend('sheets');
        return 'sheets';
      }
    } catch (err) {
      console.debug('[Auth] GS token verify failed (or not GS token)');
    }

    // Try main server verification (if API supports it)
    try {
      if (typeof api.auth?.verifyToken === 'function') {
        const mainUser = await api.auth.verifyToken(token);
        if (mainUser) {
          console.debug('[Auth] Token verified by main server');
          setUser(mainUser);
          setAuthBackend('main');
          return 'main';
        }
      }
    } catch (err) {
      console.debug('[Auth] Main server token verify failed');
    }

    return 'none';
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // DEV bypass
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Using mock user data', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        setAuthBackend('main');
        setLoading(false);
        return;
      }

      // IMPORTANT: prefer gs-auth-token first (so we don't accidentally try to use a server token for GS calls)
      const gsToken = typeof window !== 'undefined' ? localStorage.getItem('gs-auth-token') : null;
      const mainToken = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

      if (!gsToken && !mainToken) {
        // no token at all
        setUser(null);
        setLoading(false);
        return;
      }

      // Try gs token first (if present), then fall back to main token if gs didn't validate
      let verifiedBackend: AuthBackend | 'none' = 'none';

      if (gsToken) {
        console.debug('[Auth] Trying gs-auth-token for verification');
        verifiedBackend = await verifyTokenAndLoadUser(gsToken);
        // If gs token validated, we are done
        if (verifiedBackend === 'sheets') {
          setLoading(false);
          return;
        }
        // else fallthrough to try mainToken (if exists)
      }

      if (mainToken) {
        console.debug('[Auth] Trying auth-token (main) for verification');
        verifiedBackend = await verifyTokenAndLoadUser(mainToken);
        if (verifiedBackend !== 'none') {
          setLoading(false);
          return;
        }
      }

      // If verification failed for both tokens, clear tokens and try backend discovery as a fallback
      console.debug('[Auth] Token verification failed for both tokens (if present). Trying backend discovery as fallback.');

      const backend = await determineBackend();
      setAuthBackend(backend);

      if (backend === 'sheets') {
        // If we detected sheets backend but have no valid gs token, we cannot fetch /me — clear tokens.
        if (!gsToken) {
          console.warn('[Auth] Sheets backend up but no valid gs-auth-token present — clearing tokens.');
          localStorage.removeItem('gs-auth-token');
          localStorage.removeItem('auth-token');
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const gsUser = await gsApi.auth.getCurrentUser();
          setUser(gsUserToUser(gsUser));
          setAuthBackend('sheets');
        } catch (err) {
          console.error('[Auth] Failed to get user from Google Sheets after discovery:', err);
          localStorage.removeItem('gs-auth-token');
          localStorage.removeItem('auth-token');
          setUser(null);
        }
      } else if (backend === 'main') {
        try {
          const currentUser = await api.auth.getCurrentUser();
          setUser(currentUser);
          setAuthBackend('main');
        } catch (err) {
          console.error('[Auth] Failed to get user from main server after discovery:', err);
          localStorage.removeItem('auth-token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('gs-auth-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [determineBackend, verifyTokenAndLoadUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      // DEV mock
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock login successful', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        setAuthBackend('main');

        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
        return;
      }

      // Ensure we know which backend to use
      let backend = authBackend;
      if (backend === 'none') {
        backend = await determineBackend();
        setAuthBackend(backend);
      }

      if (backend === 'none') {
        throw new Error('No backend available. Please try again later.');
      }

      if (backend === 'sheets') {
        const response = await gsApi.auth.login({
          usernameOrEmail,
          password
        });

        if (response?.user && response?.token) {
          // gsApi.login stores tokens (gs-auth-token + auth-token) internally
          setUser(gsUserToUser(response.user));
          setAuthBackend('sheets');

          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
          return;
        } else if (response?.user) {
          // older responses may not include token if gsApi didn't persist it — but gsApi.login should set it
          setUser(gsUserToUser(response.user));
          setAuthBackend('sheets');
          router.push('/dashboard');
          return;
        } else {
          throw new Error('Google Sheets login failed');
        }
      } else {
        const response = await api.auth.login({
          email: usernameOrEmail,
          password
        });

        if (response?.user && response?.token) {
          // store token in canonical place if the client exposes helper
          if (typeof (api as any).setAuthToken === 'function') {
            try {
              (api as any).setAuthToken(response.token);
            } catch {
              // ignore if not supported
            }
          }
          setUser(response.user);
          setAuthBackend('main');

          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
          return;
        } else {
          throw new Error('Main server login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock signup successful', 'AuthProvider');
        setUser(DEV_CONFIG.MOCK_USER);
        setAuthBackend('main');
        router.push('/dashboard');
        return;
      }

      let backend = authBackend;
      if (backend === 'none') {
        backend = await determineBackend();
        setAuthBackend(backend);
      }

      if (backend === 'none') {
        throw new Error('No backend available. Please try again later.');
      }

      if (backend === 'sheets') {
        const response = await gsApi.auth.signup({
          email: credentials.email,
          password: credentials.password,
          username: credentials.username,
          name: credentials.name,
          role: credentials.role
        });

        if (response?.user) {
          setUser(gsUserToUser(response.user));
          setAuthBackend('sheets');
          router.push('/dashboard');
          return;
        } else {
          throw new Error('Google Sheets signup failed');
        }
      } else {
        const response = await api.auth.signup(credentials);

        if (response?.user && response?.token) {
          if (typeof (api as any).setAuthToken === 'function') {
            try {
              (api as any).setAuthToken(response.token);
            } catch {
              // ignore
            }
          }
          setUser(response.user);
          setAuthBackend('main');
          router.push('/dashboard');
          return;
        } else {
          throw new Error('Main server signup failed');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
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
      localStorage.removeItem('auth-token');
      localStorage.removeItem('gs-auth-token');
      setUser(null);
      setAuthBackend('none');
      router.push('/');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        logDevMode('Mock user update', 'AuthProvider');
        setUser(prev => prev ? { ...prev, ...updates } : null);
        return;
      }

      if (authBackend === 'sheets') {
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

// Hook to check which auth backend is being used
export const useAuthBackend = () => {
  const { authBackend, usingFallback } = useAuth();
  return { authBackend, usingFallback };
};
