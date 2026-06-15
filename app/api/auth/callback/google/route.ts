import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getGoogleProfile } from "@/lib/auth/google";
import { UserRepository } from "@/lib/db/repositories/user.repository";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { setAuthCookiesOnResponse } from "@/lib/auth/cookies";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "/"; // Redirect destination

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=Google auth code missing", req.url));
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.nextUrl.protocol || "http:";
    const redirectUri = `${protocol}//${host}/api/auth/callback/google`;

    // 1. Exchange code for access token
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // 2. Fetch Google profile
    const profile = await getGoogleProfile(tokens.access_token);
    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=Google profile email missing", req.url));
    }

    // 3. Find or Create User
    let user = await UserRepository.findByGoogleId(profile.id);

    if (!user) {
      // Check if user exists with the same email address
      user = await UserRepository.findByEmail(profile.email);

      if (user) {
        // Update existing user with Google credentials
        user = await UserRepository.updateById((user._id as any).toString(), {
          googleId: profile.id,
          avatar: user.avatar || profile.picture,
          isEmailVerified: true,
        });
      } else {
        // Register new user (OAuth automatic registration)
        user = await UserRepository.create({
          name: profile.name,
          email: profile.email.toLowerCase(),
          googleId: profile.id,
          avatar: profile.picture,
          isEmailVerified: true,
          role: "customer",
          isActive: true,
        });
      }
    }

    if (!user || user.isActive === false) {
      return NextResponse.redirect(
        new URL("/login?error=Account is disabled. Please contact support.", req.url)
      );
    }

    // 4. Start session and issue tokens
    const payload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const userAgent = req.headers.get("user-agent") || undefined;
    const ip = req.headers.get("x-forwarded-for") || undefined;
    await createSession({
      userId: (user._id as any).toString(),
      refreshToken,
      userAgent,
      ip,
    });

    // Update last login
    await UserRepository.updateById((user._id as any).toString(), { lastLoginAt: new Date() });

    // 5. Set cookies and redirect home or back to page (checkout)
    const redirectTarget = state.startsWith("/") ? state : "/";
    const response = new NextResponse(null, {
      status: 307,
      headers: {
        Location: new URL(redirectTarget, req.url).toString(),
      },
    });
    setAuthCookiesOnResponse(response, { accessToken, refreshToken });

    return response;
  } catch (error) {
    console.error("Google authentication callback error:", error);
    return NextResponse.redirect(new URL("/login?error=Google authentication failed", req.url));
  }
}
