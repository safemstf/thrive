// app/api/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getApiClient } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from the request cookies
    const refreshToken = request.cookies.get('auth-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Call backend refresh
    const apiClient = getApiClient();
    const authResponse = await apiClient.auth.refreshToken(); // Fixed: use auth.refreshToken()

    // Update the cookie with new token
    if (authResponse.token) {
      const response = NextResponse.json({
        success: true,
        token: authResponse.token,
        user: authResponse.user
      });

      // Set the new token in an HTTP-only cookie
      response.cookies.set('auth-token', authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}