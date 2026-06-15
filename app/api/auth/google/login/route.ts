import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from") || "/";

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.nextUrl.protocol || "http:";
    const redirectUri = `${protocol}//${host}/api/auth/callback/google`;

    // Pass the destination URL as state
    const authUrl = getGoogleAuthUrl(redirectUri, from);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google login initiation error:", error);
    return NextResponse.redirect(new URL("/login?error=Google login failed", req.url));
  }
}
