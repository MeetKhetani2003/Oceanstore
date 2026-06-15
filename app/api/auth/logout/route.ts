import { NextRequest, NextResponse } from "next/server";
import { getTokensFromRequest, clearAuthCookiesOnResponse } from "@/lib/auth/cookies";
import { revokeSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = getTokensFromRequest(req);

    if (refreshToken) {
      // Revoke the session in database
      await revokeSession(refreshToken);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    clearAuthCookiesOnResponse(response);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
