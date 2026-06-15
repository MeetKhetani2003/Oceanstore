'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import { User, Session } from './models';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/nodemailer';

// Validation Schema Types
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerAction(prevState: any, formData: FormData) {
  try {
    await connectDB();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = RegisterSchema.safeParse({ name, email, password });
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, errors: { email: ['Email already registered'] } };
    }

    const passwordHash = hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      verificationToken,
      isVerified: false,
    });

    // Send Verification Email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`;
    await sendEmail({
      to: newUser.email,
      subject: 'Verify your OCEON Account',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e8e8e8; rounded: 12px;">
          <h2 style="font-family: serif; color: #0A192F;">Welcome to OCEON</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #1E4D2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 500; margin-top: 10px;">Verify Account</a>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    // Establish Session
    const payload = { userId: newUser.id, role: newUser.role, email: newUser.email };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      userId: newUser._id,
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

    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } };
  } catch (error: any) {
    console.error('Registration server action error:', error);
    return { success: false, message: 'An unexpected error occurred during signup' };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await connectDB();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = LoginSchema.safeParse({ email, password });
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { success: false, errors: { email: ['Invalid email or password'] } };
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, errors: { email: ['Invalid email or password'] } };
    }

    // Sign Tokens
    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

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

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch (error: any) {
    console.error('Login server action error:', error);
    return { success: false, message: 'An unexpected error occurred during signin' };
  }
}

export async function logoutAction() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
    }

    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}

export async function getMe() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) return null;

    let payload = accessToken ? await verifyToken(accessToken) : null;

    if (!payload && refreshToken) {
      // Access token expired, attempt rotation
      const session = await Session.findOne({ refreshToken, isValid: true });
      if (session && session.expiresAt > new Date()) {
        const user = await User.findById(session.userId);
        if (user) {
          const userPayload = { userId: user.id, role: user.role, email: user.email };
          const newAccessToken = await signAccessToken(userPayload);
          const newRefreshToken = await signRefreshToken(userPayload);

          // Rotate session
          session.refreshToken = newRefreshToken;
          session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await session.save();

          cookieStore.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
          });

          cookieStore.set('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });

          payload = userPayload;
        }
      }
    }

    if (!payload) return null;

    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarId: user.avatarId,
      isVerified: user.isVerified,
    };
  } catch (error) {
    console.error('getMe error:', error);
    return null;
  }
}
