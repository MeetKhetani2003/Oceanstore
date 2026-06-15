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
    // Google GSI Redirect POSTs as application/x-www-form-urlencoded
    const formData = await request.formData();
    const credential = formData.get('credential') as string;

    if (!credential) {
      return new Response('Missing credential token', { status: 400 });
    }

    // Verify token with remote JWKS
    const { payload } = await jwtVerify(credential, JWKS, {
      issuer: 'https://accounts.google.com',
      audience: GOOGLE_CLIENT_ID,
    });

    const email = payload.email as string;
    const name = payload.name as string;
    const picture = payload.picture as string;

    if (!email) {
      return new Response('Invalid token payload: missing email', { status: 400 });
    }

    await connectDB();

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register new customer
      user = await User.create({
        email: email.toLowerCase(),
        name: name,
        passwordHash: 'GOOGLE_OAUTH_NO_PASSWORD',
        role: 'CUSTOMER',
        isVerified: true,
      });

      // Stream avatar to GridFS
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
      // Sync parameters
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

    // Save Session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt,
    });

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

    // Check for target redirect in cookies, default back to homepage
    const redirectTarget = cookieStore.get('authRedirect')?.value || '/';
    cookieStore.delete('authRedirect');

    // Perform server-side redirect back to the client application path
    return NextResponse.redirect(new URL(redirectTarget, request.url));

  } catch (error: any) {
    console.error('Google Redirect callback verification error:', error);
    return new Response('Google Authentication Callback Failed', { status: 500 });
  }
}
