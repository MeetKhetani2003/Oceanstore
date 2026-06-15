import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { User, Session } from '@/features/auth/models';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { uploadToGridFS } from '@/features/storage/gridfs';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '147355234716-avvp415jts8tf13kph2uudm21u5rpgvu.apps.googleusercontent.com';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ success: false, message: 'Missing Google credential token' }, { status: 400 });
    }

    // Verify Google ID Token with Google JWKS public certs (Edge-safe)
    const { payload } = await jwtVerify(credential, JWKS, {
      issuer: 'https://accounts.google.com',
      audience: GOOGLE_CLIENT_ID,
    });

    const email = payload.email as string;
    const name = payload.name as string;
    const picture = payload.picture as string; // Google avatar HTTPS URL

    if (!email) {
      return NextResponse.json({ success: false, message: 'Invalid token payload: missing email' }, { status: 400 });
    }

    await connectDB();

    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Auto-register new customer
      user = await User.create({
        email: email.toLowerCase(),
        name: name,
        passwordHash: 'GOOGLE_OAUTH_NO_PASSWORD',
        role: 'CUSTOMER',
        isVerified: true, // Google verifies emails
      });

      // Download and stream avatar to GridFS
      if (picture) {
        try {
          const imgResponse = await fetch(picture);
          if (imgResponse.ok) {
            const arrayBuffer = await imgResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const filename = `avatar_${user._id}.jpg`;
            const avatarId = await uploadToGridFS(buffer, filename, 'image/jpeg', {
              userId: user._id.toString(),
            });
            user.avatarId = avatarId;
            await user.save();
          }
        } catch (avatarError) {
          console.error('Failed to stream Google profile picture to GridFS:', avatarError);
        }
      }
    } else {
      // Sync Google attributes for existing users if missing
      let needsSave = false;
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      if (user.role && user.role.toUpperCase() !== user.role) {
        user.role = user.role.toUpperCase() as any;
        needsSave = true;
      }
      if (!user.passwordHash) {
        user.passwordHash = 'GOOGLE_OAUTH_NO_PASSWORD';
        needsSave = true;
      }
      if (!user.avatarId && picture) {
        try {
          const imgResponse = await fetch(picture);
          if (imgResponse.ok) {
            const arrayBuffer = await imgResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const filename = `avatar_${user._id}.jpg`;
            const avatarId = await uploadToGridFS(buffer, filename, 'image/jpeg', {
              userId: user._id.toString(),
            });
            user.avatarId = avatarId;
            needsSave = true;
          }
        } catch (avatarError) {
          console.error('Failed to sync Google profile picture to GridFS:', avatarError);
        }
      }
      if (needsSave) {
        await user.save();
      }
    }

    // Sign Access & Refresh Tokens
    const tokenPayload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    // Save Session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt,
    });

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarId: user.avatarId,
      },
    });

  } catch (error: any) {
    console.error('Google verification handler error:', error);
    return NextResponse.json({ success: false, message: 'Google authentication verification failed' }, { status: 500 });
  }
}
