import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mi_secreto_super_seguro_badilsa_2026'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Paths that do not require authentication
  const isPublicPath = path === '/login' || path.startsWith('/api/auth') || path.startsWith('/cotizacion/ver');

  // Paths to exclude entirely from middleware checks
  if (path.startsWith('/_next') || path.includes('/favicon.ico') || path.endsWith('.png') || path.endsWith('.jpg')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('badilsa_token')?.value;

  if (!isPublicPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error('Invalid token', error);
      // If token is invalid/expired, redirect to login and clear cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('badilsa_token');
      return response;
    }
  }

  // If trying to access /login but already logged in, redirect to home
  if (isPublicPath && path === '/login' && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Token invalid, allow them to see login page
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
