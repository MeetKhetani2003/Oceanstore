import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProfilePage = pathname.startsWith('/profile');
  const isCheckoutPage = pathname.startsWith('/checkout');
  const isAdminPage = pathname.startsWith('/admin');

  // Protected route check
  if ((isProfilePage || isCheckoutPage || isAdminPage) && !accessToken && !refreshToken) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('login', 'true');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth page redirection: always redirect login/register to the home modal trigger
  if (isAuthPage) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('login', 'true');
    const targetRedirect = request.nextUrl.searchParams.get('redirect');
    if (targetRedirect) {
      redirectUrl.searchParams.set('redirect', targetRedirect);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Role based access control for admin dashboard
  if (isAdminPage) {
    if (accessToken) {
      const payload = await verifyToken(accessToken);
      if (!payload || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (refreshToken) {
      // Access token expired, let it fall through so the Server Component getMe() rotates it.
      return NextResponse.next();
    } else {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('login', 'true');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*', '/admin/:path*', '/login', '/register'],
};
