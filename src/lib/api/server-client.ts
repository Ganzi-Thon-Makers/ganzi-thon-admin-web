import type {
  ApiErrorCode,
  ApiErrorResolutionOptions,
  ApiErrorResponse,
  ApiErrorResult,
  ApiFieldError,
  ApiResult,
  ApiSuccessResponse,
  ServerApiRequestOptions,
} from '@/lib/api/types';

/** Route Handler / Server Action 공용 API 오류 기본 메시지 */
export const DEFAULT_API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  CONFIG_ERROR: '서버 API 주소 설정이 필요합니다.',
  NETWORK_ERROR: '서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN_ERROR: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * Route Handler / Server Action 환경 변수에서 API 기본 URL을 읽고 후행 슬래시를 제거한다.
 * @returns 정규화된 API 기본 URL 또는 미설정 시 null
 */
export function getApiBaseUrl(): string | null {
  const trimmed = process.env.API_BASE_URL?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : null;
}

/**
 * 응답 본문을 JSON으로 파싱한다.
 * @param response fetch 응답 객체
 * @returns 파싱된 응답 또는 파싱 실패 시 null
 */
async function safeParseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/**
 * 입력 검증 오류에서 첫 번째 상세 사유를 찾는다.
 * @param errors 서버가 반환한 필드 오류 목록
 * @returns 첫 번째 사유 또는 사유가 없을 때 undefined
 */
function extractFirstFieldErrorReason(errors?: ApiFieldError[]): string | undefined {
  for (const error of errors ?? []) {
    if (error.reason) return error.reason;
  }
  return undefined;
}

/**
 * 서버 오류 코드와 HTTP 상태를 공통 오류 코드로 변환한다.
 * @param status HTTP 상태 코드
 * @param rawCode 서버 오류 코드
 * @returns 정규화된 공통 오류 코드
 */
function resolveApiErrorCode(status: number, rawCode?: string): ApiErrorCode {
  switch (rawCode) {
    case 'INVALID_INPUT':
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
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
 * 서버 오류 응답을 도메인별 설정에 맞춰 실패 결과로 정규화한다.
 * @param status HTTP 상태 코드
 * @param errorBody 파싱된 오류 응답
 * @param options 오류 코드 / 메시지 해석 설정
 * @returns 정규화된 API 실패 결과
 */
function toApiErrorResult<TErrorCode extends string>(
  status: number,
  errorBody: ApiErrorResponse | null,
  options: ApiErrorResolutionOptions<TErrorCode>,
): ApiErrorResult<TErrorCode> {
  const resolveErrorCode = options.resolveErrorCode ?? resolveApiErrorCode;
  const rawCode = errorBody?.code;
  const fallbackCode = status === 401 ? options.unauthorizedFallbackCode : undefined;
  const code =
    rawCode !== undefined
      ? resolveErrorCode(status, rawCode)
      : (fallbackCode ?? resolveErrorCode(status));
  const fieldReason = extractFirstFieldErrorReason(errorBody?.errors);
  const serverMessage = errorBody?.message?.trim();
  const defaultMessage =
    options.errorMessages?.[code] ?? DEFAULT_API_ERROR_MESSAGES[resolveApiErrorCode(status, code)];

  return {
    ok: false,
    status,
    code,
    message:
      code === 'INVALID_INPUT' && fieldReason ? fieldReason : serverMessage || defaultMessage,
  };
}

/**
 * Route Handler / Server Action에서 JSON API를 호출하고 응답과 통신 오류를 정규화한다.
 * @param endpoint 기본 URL 뒤에 결합할 API 경로
 * @param options 요청 / 도메인 오류 해석 설정
 * @param validateResponse 성공 응답을 도메인 데이터로 검증하는 함수
 * @returns 성공 데이터 또는 정규화된 실패 결과
 */
export async function requestServerApi<
  TData,
  TErrorCode extends string = ApiErrorCode,
  TResponse = TData,
>(
  endpoint: string,
  options: ServerApiRequestOptions<TErrorCode> = {},
  validateResponse?: (
    payload: ApiSuccessResponse<TResponse> | null,
  ) => ApiResult<TData, TErrorCode>,
): Promise<ApiResult<TData, TErrorCode>> {
  const baseUrl =
    options.baseUrlKey === 'backoffice'
      ? process.env.BACKOFFICE_API_BASE_URL?.trim().replace(/\/+$/, '')
      : getApiBaseUrl();
  if (!baseUrl) {
    return {
      ok: false,
      status: 500,
      code: 'CONFIG_ERROR',
      message: options.errorMessages?.CONFIG_ERROR ?? DEFAULT_API_ERROR_MESSAGES.CONFIG_ERROR,
    };
  }

  try {
    const headers = new Headers(options.headers);
    if (options.body !== undefined) headers.set('Content-Type', 'application/json');
    const response = await fetch(`${baseUrl}/${endpoint.replace(/^\/+/, '')}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await safeParseJson<ApiErrorResponse>(response);
      return toApiErrorResult(response.status, errorBody, options);
    }

    if (options.responseType === 'empty') return { ok: true, data: null as TData };
    const payload = await safeParseJson<ApiSuccessResponse<TResponse>>(response);
    if (validateResponse) return validateResponse(payload);
    return { ok: true, data: (payload?.data ?? null) as TData };
  } catch {
    return {
      ok: false,
      status: 503,
      code: 'NETWORK_ERROR',
      message: options.errorMessages?.NETWORK_ERROR ?? DEFAULT_API_ERROR_MESSAGES.NETWORK_ERROR,
    };
  }
}
