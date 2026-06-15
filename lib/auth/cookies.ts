import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const COOKIE_NAMES = {
  ACCESS: "oc_access",
  REFRESH: "oc_refresh",
  GUEST_TOKEN: "oc_guest",
} as const;

const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookiesOnResponse(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
): void {
  res.cookies.set(COOKIE_NAMES.ACCESS, tokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: 15 * 60, // 15 minutes
  });
  res.cookies.set(COOKIE_NAMES.REFRESH, tokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookiesOnResponse(res: NextResponse): void {
  res.cookies.set(COOKIE_NAMES.ACCESS, "", {
    ...COOKIE_BASE,
    maxAge: 0,
  });
  res.cookies.set(COOKIE_NAMES.REFRESH, "", {
    ...COOKIE_BASE,
    maxAge: 0,
  });
}

export function getTokensFromRequest(req: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: req.cookies.get(COOKIE_NAMES.ACCESS)?.value ?? null,
    refreshToken: req.cookies.get(COOKIE_NAMES.REFRESH)?.value ?? null,
  };
}

export async function getTokensFromCookies(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(COOKIE_NAMES.ACCESS)?.value ?? null,
    refreshToken: cookieStore.get(COOKIE_NAMES.REFRESH)?.value ?? null,
  };
}

export function getGuestToken(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAMES.GUEST_TOKEN)?.value ?? null;
}

export function setGuestTokenOnResponse(
  res: NextResponse,
  token: string
): void {
  res.cookies.set(COOKIE_NAMES.GUEST_TOKEN, token, {
    ...COOKIE_BASE,
    httpOnly: false, // accessible from JS for cart operations
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}
