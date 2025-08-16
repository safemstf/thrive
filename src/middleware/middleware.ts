// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

import { DEV_CONFIG, logDevMode } from '@/config/dev';

// Define which routes require authentication
const protectedRoutes = ['/admin', '/dashboard', '/profile'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/signup', '/', '/about', '/contact'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  
  // 🔓 BYPASS ALL AUTH IN DEV MODE
  if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
    logDevMode(`Skipping auth for: ${pathname}`, 'Middleware');
    
    // Add mock user headers for server components that expect them
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', DEV_CONFIG.MOCK_HEADERS['x-user-id']);
    requestHeaders.set('x-user-role', DEV_CONFIG.MOCK_HEADERS['x-user-role']);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/api/')
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token with backend
      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete('auth-token');
        return res;
      }

      const { user } = await response.json();

      if (isAdminRoute && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Add user info to headers for use in server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-role', user.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('auth-token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};