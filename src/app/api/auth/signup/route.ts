// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call backend API - adjust fields to match your backend expectations
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        password: body.password,
        name: body.name,
        // If backend still expects firstName/lastName
        firstName: body.name.split(' ')[0],
        lastName: body.name.split(' ').slice(1).join(' ') || undefined
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Signup failed:", data);      // ①
      return NextResponse.json(
        { error: data.error, messages: data.messages },
        { status: response.status }
      );
    }


    // Set HTTP-only cookie
    (await
      // Set HTTP-only cookie
      cookies()).set('auth-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({
      user: data.user,
      message: data.message || 'Signup successful'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}