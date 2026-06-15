import { NextRequest, NextResponse } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/auth/jwt-edge";
import { COOKIE_NAMES } from "@/lib/auth/cookies";

const PROTECTED_ROUTES = [
  { pattern: /^\/dashboard/, minRole: 0 },
  { pattern: /^\/profile/, minRole: 0 },
  { pattern: /^\/admin/, minRole: 2 },
  { pattern: /^\/api\/admin/, minRole: 2 },
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

const ROLE_HIERARCHY: Record<string, number> = {
  customer: 0,
  manager: 1,
  admin: 2,
  "super-admin": 3,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting headers for API routes
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Get access token from cookie
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS)?.value;
  console.log(`[Middleware] Path: ${pathname}, Token present: ${!!accessToken}`);
  let userPayload: {
    userId: string;
    email: string;
    role: string;
  } | null = null;

  if (accessToken) {
    try {
      userPayload = await verifyAccessTokenEdge(accessToken);
      console.log(`[Middleware] Token verified successfully for user: ${userPayload.email}`);
      // Inject user info into request headers for server components
      response.headers.set("x-user-id", userPayload.userId);
      response.headers.set("x-user-email", userPayload.email);
      response.headers.set("x-user-role", userPayload.role);
    } catch (err: any) {
      console.log(`[Middleware] Token verification failed: ${err.message}`);
      // Token expired or invalid — clear cookies and let protected route redirect
      if (
        PROTECTED_ROUTES.some((r) => r.pattern.test(pathname)) &&
        !pathname.startsWith("/api/")
      ) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.cookies.set(COOKIE_NAMES.ACCESS, "", { maxAge: 0 });
        return redirectRes;
      }
    }
  }

  // Protect dashboard / admin routes
  const protectedRoute = PROTECTED_ROUTES.find((r) =>
    r.pattern.test(pathname)
  );
  if (protectedRoute) {
    if (!userPayload) {
      if (!pathname.startsWith("/api/")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userRoleLevel = ROLE_HIERARCHY[userPayload.role] ?? 0;
    if (userRoleLevel < protectedRoute.minRole) {
      if (!pathname.startsWith("/api/")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Redirect already-logged-in users away from auth pages
  if (userPayload && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/images).*)",
  ],
};
