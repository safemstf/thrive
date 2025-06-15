// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('auth-token')?.value;

    if (token) {
      // Call backend logout
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Clear cookie
    (await
      // Clear cookie
      cookies()).delete('auth-token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    // Still clear cookie even if backend call fails
    (await
      // Still clear cookie even if backend call fails
      cookies()).delete('auth-token');
    return NextResponse.json({ message: 'Logged out successfully' });
  }
}