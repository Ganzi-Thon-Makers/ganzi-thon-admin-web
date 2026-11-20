import { type NextRequest, NextResponse } from 'next/server';

/**
 * 요청 경로와 쿠키의 인증 정보를 검증하여 미인증 요청을 루트 경로로 리다이렉트한다.
 * @param request Next.js 요청 객체
 * @returns 요청 통과 또는 루트 경로 리다이렉트 응답
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('ganzithon_bo_access_token')?.value;
  const refreshToken = request.cookies.get('ganzithon_bo_refresh_token')?.value;
  const role = request.cookies.get('ganzithon_bo_role')?.value;
  const authenticated = Boolean(
    (accessToken || refreshToken) && (role === 'ADMIN' || role === 'SUPER_ADMIN'),
  );

  if (!authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static(?:/|$)|_next/image(?:/|$)|.*\\.[^/]+$).*)'],
};
