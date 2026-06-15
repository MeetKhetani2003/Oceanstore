import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Session } from '@/features/auth/models';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    await connectDB();
    const email = 'testuser@oceon.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: 'Test User',
        passwordHash: 'TEST_USER_NO_PASSWORD',
        role: 'CUSTOMER',
        isVerified: true,
      });
    }

    const tokenPayload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.redirect(new URL('/profile', request.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
