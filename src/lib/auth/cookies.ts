import { cookies } from 'next/headers';

import type { BackofficeAuthTokens, BackofficeRole } from '@/lib/auth/types';

/**
 * 백오피스 인증 토큰과 역할을 저장하는 서버 전용 쿠키 이름
 */
export const AUTH_COOKIE_NAMES = {
  accessToken: 'ganzithon_bo_access_token',
  refreshToken: 'ganzithon_bo_refresh_token',
  role: 'ganzithon_bo_role',
} as const;

const ALLOWED_BACKOFFICE_ROLES: readonly BackofficeRole[] = ['ADMIN', 'SUPER_ADMIN'];

/**
 * 전달된 값이 백오피스 허용 관리자 역할인지 판별한다.
 * @param role 검증할 역할 값
 * @returns ADMIN 또는 SUPER_ADMIN 일치 여부
 */
export function isBackofficeRole(role: unknown): role is BackofficeRole {
  return typeof role === 'string' && ALLOWED_BACKOFFICE_ROLES.includes(role as BackofficeRole);
}

/**
 * 서버 인증 쿠키에 공통으로 적용할 보안 옵션을 반환한다.
 * @returns HttpOnly / Secure / SameSite / Path 쿠키 설정 객체
 */
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

/**
 * 백오피스 인증 토큰과 역할을 HttpOnly 보안 쿠키에 저장한다.
 * @param tokens 저장할 accessToken / refreshToken / role 정보
 */
export async function setAuthCookies(tokens: BackofficeAuthTokens): Promise<void> {
  const cookieStore = await cookies();
  const options = getAuthCookieOptions();

  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.role, tokens.role, options);
}

/**
 * 서버에 저장된 백오피스 인증 쿠키를 모두 삭제한다.
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.role);
}

/**
 * 현재 요청 쿠키에서 백오피스 인증 토큰과 역할을 읽는다.
 * @returns 저장된 accessToken / refreshToken / role 정보
 */
export async function getServerAuthTokens(): Promise<{
  accessToken?: string;
  refreshToken?: string;
  role?: BackofficeRole;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
  const rawRole = cookieStore.get(AUTH_COOKIE_NAMES.role)?.value;

  return {
    accessToken,
    refreshToken,
    role: isBackofficeRole(rawRole) ? rawRole : undefined,
  };
}

/**
 * 토큰 원문을 노출하지 않고 현재 백오피스 인증 여부와 역할만 조회한다.
 * @returns 인증 여부와 역할 정보
 */
export async function getServerAuthSession(): Promise<{
  authenticated: boolean;
  role: BackofficeRole | null;
}> {
  const { accessToken, refreshToken, role } = await getServerAuthTokens();
  const authenticated = Boolean((accessToken || refreshToken) && role);

  return {
    authenticated,
    role: authenticated && role ? role : null,
  };
}
