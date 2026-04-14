import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createToken } from '@/lib/auth/jwt';

// 인증 필요 라우트
const protectedRoutes = [
  '/home',
  '/reserve',
  '/reservations',
  '/profile',
  '/chat',
  '/dashboard',
  '/calendar',
  '/master-reservations',
  '/schedule',
  '/members',
  '/join-codes',
  '/master-profile',
  '/master-mypage',
  '/master-chat',
  '/masters/approval',
  '/join',
];

// 인증 불필요 라우트 (로그인된 유저는 리다이렉트)
const authRoutes = ['/login', '/signup'];

// master 전용 라우트
const masterRoutes = [
  '/dashboard',
  '/calendar',
  '/master-reservations',
  '/schedule',
  '/members',
  '/join-codes',
  '/master-profile',
  '/master-mypage',
  '/master-chat',
];

// user 전용 라우트
const userRoutes = ['/home', '/reserve', '/reservations', '/profile', '/chat'];

// admin 전용 라우트
const adminRoutes = ['/masters/approval'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  let user = null;
  if (token) {
    user = await verifyToken(token);
  }

  // 루트 페이지 → 인증 상태에 따라 리다이렉트
  if (pathname === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role === 'master') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/masters/approval', request.url));
    }
    if (user.masterId) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.redirect(new URL('/join', request.url));
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 보호된 라우트인데 인증되지 않은 경우
  if (isProtectedRoute && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 로그인/회원가입 페이지인데 이미 로그인된 경우
  if (isAuthRoute && user) {
    if (user.role === 'master') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/masters/approval', request.url));
    } else if (user.masterId) {
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      return NextResponse.redirect(new URL('/join', request.url));
    }
  }

  // 역할 기반 접근 제어
  if (user) {
    const isMasterRoute = masterRoutes.some((route) => pathname.startsWith(route));
    const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

    if (isMasterRoute && user.role !== 'master') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isUserRoute && user.role !== 'user' && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isAdminRoute && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // user가 멤버십 없이 예약 관련 페이지 접근 시 join으로 리다이렉트
    if (user.role === 'user' && !user.masterId && pathname !== '/join') {
      if (isUserRoute) {
        return NextResponse.redirect(new URL('/join', request.url));
      }
    }
  }

  // 세션 갱신: 만료까지 6일 미만 남았을 때만 7일로 재연장 (하루 1회 수준)
  const response = NextResponse.next();
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exp = (user as any).exp as number | undefined;
    const sixDaysInSec = 60 * 60 * 24 * 6;
    const needsRenewal = !exp || exp - Date.now() / 1000 < sixDaysInSec;

    if (needsRenewal) {
      const newToken = await createToken({
        userId: user.userId,
        email: user.email,
        role: user.role,
        ...(user.masterId && { masterId: user.masterId }),
      });
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
