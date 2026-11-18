'use server';

import {
  requestBackofficeLogin,
  requestBackofficeLogout,
  requestBackofficeRefresh,
} from '@/lib/auth/api';
import { clearAuthCookies, getServerAuthTokens, setAuthCookies } from '@/lib/auth/cookies';
import type { AuthActionResult, LoginFormState } from '@/lib/auth/types';

/**
 * 로그인 폼 제출을 처리하고 성공 시 HttpOnly 보안 쿠키에 인증 토큰을 저장한다.
 * @param _prevState 이전 로그인 폼 액션 상태
 * @param formData 제출된 로그인 폼 데이터
 * @returns 로그인 성공 또는 오류 상태 객체
 */
export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const rawLoginId = formData.get('loginId') ?? formData.get('username');
  const rawPassword = formData.get('password');

  const loginId = typeof rawLoginId === 'string' ? rawLoginId.trim() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  // 빈 입력값은 네트워크 호출 전에 차단해 불필요한 백엔드 요청을 방지한다.
  if (!loginId || !password.trim()) {
    return {
      status: 'error',
      loginId,
      errorCode: 'INVALID_INPUT',
      errorMessage: '아이디와 비밀번호를 모두 입력해주세요.',
    };
  }

  const result = await requestBackofficeLogin({ loginId, password });

  if (!result.ok) {
    return {
      status: 'error',
      loginId,
      errorCode: result.code,
      errorMessage: result.message,
    };
  }

  await setAuthCookies(result.data);

  return {
    status: 'success',
    loginId,
    role: result.data.role,
  };
}

/**
 * 쿠키의 refreshToken으로 백오피스 액세스 / 리프레시 토큰을 재발급한다.
 * @returns 토큰 재발급 성공 여부와 역할 또는 오류 정보
 */
export async function refreshSessionAction(): Promise<AuthActionResult> {
  const { refreshToken } = await getServerAuthTokens();

  if (!refreshToken) {
    await clearAuthCookies();
    return {
      ok: false,
      errorCode: 'INVALID_REFRESH_TOKEN',
      errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해주세요.',
    };
  }

  const result = await requestBackofficeRefresh({ refreshToken });

  if (!result.ok) {
    if (result.code === 'INVALID_REFRESH_TOKEN' || result.code === 'UNAUTHORIZED') {
      await clearAuthCookies();
    }

    return {
      ok: false,
      errorCode: result.code,
      errorMessage: result.message,
    };
  }

  await setAuthCookies(result.data);

  return {
    ok: true,
    role: result.data.role,
  };
}

/**
 * 백오피스 로그아웃 API를 호출하고 서버 인증 쿠키를 정리한다.
 * @returns 로그아웃 처리 결과
 */
export async function logoutAction(): Promise<AuthActionResult> {
  const { accessToken, refreshToken } = await getServerAuthTokens();

  let actionResult: AuthActionResult = { ok: true };

  if (accessToken) {
    let logoutResult = await requestBackofficeLogout(accessToken);

    // 액세스 토큰이 만료된 경우 refreshToken으로 1회 재발급 후 서버 세션 종료를 재시도한다.
    if (!logoutResult.ok && logoutResult.code === 'TOKEN_EXPIRED' && refreshToken) {
      const refreshResult = await requestBackofficeRefresh({ refreshToken });
      if (refreshResult.ok) {
        logoutResult = await requestBackofficeLogout(refreshResult.data.accessToken);
      }
    }

    if (!logoutResult.ok) {
      actionResult = {
        ok: false,
        errorCode: logoutResult.code,
        errorMessage: logoutResult.message,
      };
    }
  }

  // 원격 세션 만료 / 네트워크 오류 여부와 무관하게 브라우저 인증 쿠키는 항상 삭제한다.
  await clearAuthCookies();

  return actionResult;
}
