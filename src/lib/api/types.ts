/** API 입력 검증 오류 필드 항목 */
export interface ApiFieldError {
  field?: string;
  reason?: string;
}

/** 서버 오류 응답 규격 */
export interface ApiErrorResponse {
  status?: number;
  code?: string;
  message?: string;
  errors?: ApiFieldError[];
}

/** 서버 성공 응답 래퍼 규격 */
export interface ApiSuccessResponse<T> {
  data?: T;
  message?: string;
}

/** JSON API에서 지원하는 HTTP 메서드 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** 공통 API 오류 코드 */
export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFIG_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/** Route Handler / Server Action API 요청 성공 결과 */
export interface ApiSuccessResult<TData> {
  ok: true;
  data: TData;
}

/** Route Handler / Server Action API 요청 실패 결과 */
export interface ApiErrorResult<TErrorCode extends string = ApiErrorCode> {
  ok: false;
  status: number;
  code: TErrorCode | ApiErrorCode;
  message: string;
}

/** Route Handler / Server Action API 요청의 성공 / 실패 결과 */
export type ApiResult<TData, TErrorCode extends string = ApiErrorCode> =
  ApiSuccessResult<TData> | ApiErrorResult<TErrorCode>;

/** 도메인별 오류 코드 / 메시지 해석 설정 */
export interface ApiErrorResolutionOptions<TErrorCode extends string = ApiErrorCode> {
  resolveErrorCode?: (status: number, rawCode?: string) => TErrorCode;
  errorMessages?: Partial<Record<TErrorCode | ApiErrorCode, string>>;
  unauthorizedFallbackCode?: TErrorCode;
}

/** Route Handler / Server Action에서 사용하는 JSON API 요청 설정 */
export interface ServerApiRequestOptions<
  TErrorCode extends string = ApiErrorCode,
> extends ApiErrorResolutionOptions<TErrorCode> {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  responseType?: 'json' | 'empty';
}
