import type {
  ApiErrorResponse,
  ApiFieldError,
  ApiResult,
  ApiSuccessResponse,
} from '@/lib/api/types';

export type { ApiErrorResponse, ApiFieldError, ApiResult, ApiSuccessResponse };

/** 백오피스 / 플랫폼 전체 사용자 역할 */
export type UserRole = 'PARTICIPANT' | 'TEAM' | 'ADMIN' | 'SUPER_ADMIN';

/** 백오피스 접근이 허용된 관리자 역할 */
export type BackofficeRole = 'ADMIN' | 'SUPER_ADMIN';

/** 백오피스 로그인 요청 본문 */
export interface LoginRequest {
  loginId: string;
  password: string;
}

/** 백오피스 토큰 재발급 요청 본문 */
export interface RefreshRequest {
  refreshToken: string;
}

/** 로그인 / 토큰 재발급 성공 응답 데이터 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

/** 관리자 권한 검증을 통과한 인증 토큰 정보 */
export interface BackofficeAuthTokens {
  accessToken: string;
  refreshToken: string;
  role: BackofficeRole;
}

/** 백오피스 인증 처리 중 발생할 수 있는 오류 코드 */
export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'INVALID_REFRESH_TOKEN'
  | 'CONFIG_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/** 백오피스 인증 API 호출 결과 */
export type AuthApiResult<T> = ApiResult<T, AuthErrorCode>;

/** 로그인 폼 Server Action 상태 */
export interface LoginFormState {
  status: 'idle' | 'success' | 'error';
  loginId?: string;
  role?: BackofficeRole;
  errorCode?: AuthErrorCode;
  errorMessage?: string;
}

/** 세션 갱신 / 로그아웃 Server Action 실행 결과 */
export interface AuthActionResult {
  ok: boolean;
  role?: BackofficeRole;
  errorCode?: AuthErrorCode;
  errorMessage?: string;
}
