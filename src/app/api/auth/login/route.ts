// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Fix URL construction - remove trailing slash if present
const BACKEND_URL = (process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function POST(request: NextRequest) {
  try {
    const { usernameOrEmail, password } = await request.json();

    console.log('Login attempt for:', usernameOrEmail);
    console.log('Backend URL:', `${BACKEND_URL}/api/auth/login`);

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add ngrok header to skip browser warning
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ usernameOrEmail, password })
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: 'Backend error', message: errorText };
      }

      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Login successful for:', usernameOrEmail);

    // Set HTTP-only cookie
    (await cookies()).set('auth-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({ 
      user: data.user, 
      message: data.message || 'Login successful' 
    });

  } catch (error) {
    console.error('NextJS login error:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Cannot connect to backend server. Please check if the backend is running.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}