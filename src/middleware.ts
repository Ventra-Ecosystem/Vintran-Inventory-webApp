import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/no-business',
  '/onboarding',
  '/create-business',
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow Next.js internals, static assets, and api proxies
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = request.cookies.get('auth-token')?.value;

  // Unauthenticated user attempting to access protected route
  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/' && pathname !== '/dashboard' && pathname !== '/home') {
      loginUrl.searchParams.set('next', pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user attempting to access public auth page (login/register/forgot/reset)
  const isStrictAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].some((p) => pathname.startsWith(p));

  if (token && isStrictAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
