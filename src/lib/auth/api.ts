import { requestServerApi } from '@/lib/api/server-client';
import { isBackofficeRole } from '@/lib/auth/cookies';
import type {
  ApiSuccessResponse,
  AuthApiResult,
  AuthErrorCode,
  BackofficeAuthTokens,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
} from '@/lib/auth/types';

/** 백오피스 인증 API 엔드포인트 경로 */
export const BACKOFFICE_AUTH_ENDPOINTS = {
  login: '/backoffice/api/v1/auth/login',
  refresh: '/backoffice/api/v1/auth/refresh',
  logout: '/backoffice/api/v1/auth/logout',
} as const;

/** 백오피스 인증 API 오류 기본 메시지 */
const DEFAULT_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
  FORBIDDEN: '권한이 없습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  INVALID_REFRESH_TOKEN: '유효하지 않은 토큰입니다. 다시 로그인해주세요.',
  CONFIG_ERROR: '서버 API 주소 설정이 필요합니다.',
  NETWORK_ERROR: '인증 서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN_ERROR: '인증 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * HTTP 상태 코드와 서버 응답 오류 코드를 인증 오류 코드로 변환한다.
 * @param status HTTP 상태 코드
 * @param rawCode 서버 응답 오류 코드
 * @returns 변환된 인증 오류 코드
 */
function resolveAuthErrorCode(status: number, rawCode?: string): AuthErrorCode {
  switch (rawCode) {
    case 'INVALID_INPUT':
    case 'INVALID_CREDENTIALS':
    case 'FORBIDDEN':
    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
    case 'INVALID_REFRESH_TOKEN':
      return rawCode;
    default:
      break;
  }

  if (status === 400) return 'INVALID_INPUT';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  return 'UNKNOWN_ERROR';
}

/**
 * 로그인 / 토큰 재발급 응답 데이터를 검증해 백오피스 토큰 정보로 변환한다.
 * @param payload 파싱된 성공 응답 본문
 * @returns 검증된 토큰 정보 또는 실패 결과
 */
function validateLoginPayload(
  payload: ApiSuccessResponse<LoginResponse> | null,
): AuthApiResult<BackofficeAuthTokens> {
  const data = payload?.data;

  if (!data?.accessToken || !data?.refreshToken || !data?.role) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '인증 응답 형식이 올바르지 않습니다.',
    };
  }

  if (!isBackofficeRole(data.role)) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: DEFAULT_ERROR_MESSAGES.FORBIDDEN,
    };
  }

  return {
    ok: true,
    data: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
    },
  };
}

/**
 * 로그인 / 토큰 재발급 인증 엔드포인트에 POST 요청을 전송하고 토큰 응답을 검증한다.
 * @param endpoint 호출할 백오피스 인증 엔드포인트 경로
 * @param payload 직렬화할 요청 본문 데이터
 * @param unauthorizedFallbackCode 서버 오류 코드가 없는 401 응답 시 적용할 기본 오류 코드
 * @returns 검증된 토큰 정보 또는 정규화된 실패 결과
 */
async function postAuthTokenRequest<TRequest>(
  endpoint: string,
  payload: TRequest,
  unauthorizedFallbackCode: AuthErrorCode,
): Promise<AuthApiResult<BackofficeAuthTokens>> {
  return requestServerApi<BackofficeAuthTokens, AuthErrorCode, LoginResponse>(
    endpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      resolveErrorCode: resolveAuthErrorCode,
      errorMessages: DEFAULT_ERROR_MESSAGES,
      unauthorizedFallbackCode,
    },
    validateLoginPayload,
  );
}

/**
 * 백오피스 로그인 API(POST /backoffice/api/v1/auth/login)를 호출한다.
 * @param payload 로그인 아이디와 비밀번호
 * @returns 성공 시 토큰 / 역할 정보 또는 실패 시 정규화된 오류 결과
 */
export function requestBackofficeLogin(
  payload: LoginRequest,
): Promise<AuthApiResult<BackofficeAuthTokens>> {
  return postAuthTokenRequest(BACKOFFICE_AUTH_ENDPOINTS.login, payload, 'INVALID_CREDENTIALS');
}

/**
 * 백오피스 토큰 재발급 API(POST /backoffice/api/v1/auth/refresh)를 호출한다.
 * @param payload 재발급에 사용할 리프레시 토큰 정보
 * @returns 성공 시 새 토큰 / 역할 정보 또는 실패 시 정규화된 오류 결과
 */
export function requestBackofficeRefresh(
  payload: RefreshRequest,
): Promise<AuthApiResult<BackofficeAuthTokens>> {
  return postAuthTokenRequest(BACKOFFICE_AUTH_ENDPOINTS.refresh, payload, 'INVALID_REFRESH_TOKEN');
}

/**
 * 백오피스 로그아웃 API(POST /backoffice/api/v1/auth/logout)를 호출한다.
 * @param accessToken Authorization 헤더에 전달할 액세스 토큰
 * @returns 로그아웃 성공 결과 또는 정규화된 오류 결과
 */
export async function requestBackofficeLogout(accessToken: string): Promise<AuthApiResult<null>> {
  return requestServerApi<null, AuthErrorCode>(BACKOFFICE_AUTH_ENDPOINTS.logout, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'empty',
    resolveErrorCode: resolveAuthErrorCode,
    errorMessages: DEFAULT_ERROR_MESSAGES,
  });
}
