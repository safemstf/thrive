// components/auth/authGuard.tsx
'use client';

import { useAuth } from '@/providers/authProvider';
import { LoginForm } from './loginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: React.ReactNode;
  showLoginForm?: boolean;
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  fallback,
  showLoginForm = false 
}: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (showLoginForm) {
      return <LoginForm />;
    }
    return fallback || <div>Access denied. Please log in.</div>;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return fallback || <div>Admin access required.</div>;
  }

  return <>{children}</>;
}