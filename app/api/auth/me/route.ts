import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { UserRepository } from "@/lib/db/repositories/user.repository";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(COOKIE_NAMES.ACCESS)?.value;
    if (!accessToken) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    try {
      const payload = verifyAccessToken(accessToken);
      const user = await UserRepository.findById(payload.userId);
      if (!user) {
        return NextResponse.json({ authenticated: false, user: null });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          addresses: user.addresses,
        },
      });
    } catch {
      return NextResponse.json({ authenticated: false, user: null });
    }
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
