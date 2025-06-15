// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiClient } from '@/lib/api-client';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' }, 
        { status: 401 }
      );
    }

    // Call backend refresh
    const apiClient = getApiClient();
    const authResponse = await apiClient.refreshToken();

    // Update the cookie with new token
    if (authResponse.token) {
      cookieStore.set('auth-token', authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return NextResponse.json(authResponse.user);
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear invalid token
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    
    return NextResponse.json(
      { error: 'Token refresh failed' }, 
      { status: 401 }
    );
  }
}