import 'server-only';

import { requestServerApi } from '@/lib/api/server-client';
import type { ApiErrorCode, ApiResult, ApiSuccessResponse } from '@/lib/api/types';
import { getServerAuthTokens } from '@/lib/auth/cookies';

import { TIMETABLE_EVENT_DATE, timetableTimestamp } from './timetable-time';

export { TIMETABLE_EVENT_DATE } from './timetable-time';

export interface TimetableItem {
  /** 일정 식별자 */
  id: number;
  /** 일정 제목 */
  title: string;
  /** 일정 상세 내용 */
  description: string;
  /** 시작 시간 (HH:mm / HH:mm:ss 또는 ISO 일시) */
  startTime: string;
  /** 종료 시간 (HH:mm / HH:mm:ss 또는 ISO 일시) */
  endTime: string;
}

/**
 * 시간을 정렬 가능한 값으로 변환한다.
 * @param value HH:mm / HH:mm:ss 또는 ISO 일시
 * @returns 시각의 밀리초 값
 */
export function parseTimeOrderValue(value: string): number {
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
    const [hours, minutes, seconds = 0] = value.split(':').map(Number);
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  }
  return Date.parse(value);
}

/**
 * 지원하는 시간 형식과 유효한 시각인지 확인한다.
 * @param value 검증할 시간
 * @returns 시간 유효 여부
 */
export function isValidTimeString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) return true;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && Number.isFinite(Date.parse(value));
}

/**
 * 시작 시간 / 종료 시간 / 식별자 순으로 비교한다.
 * @param left 비교할 첫 일정
 * @param right 비교할 두 번째 일정
 * @returns 정렬 순서
 */
export function compareTimetables(left: TimetableItem, right: TimetableItem): number {
  return (
    parseTimeOrderValue(left.startTime) - parseTimeOrderValue(right.startTime) ||
    parseTimeOrderValue(left.endTime) - parseTimeOrderValue(right.endTime) ||
    left.id - right.id
  );
}

type TimetableResponse = Omit<TimetableItem, 'description'> & { description: string | null };

/**
 * 목록 항목이 표시 가능한 일정인지 확인한다.
 * @param item 검증할 응답 항목
 * @returns 일정 형식 일치 여부
 */
function isTimetableItem(item: unknown): item is TimetableResponse {
  if (item === null || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  return (
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    typeof value.title === 'string' &&
    (typeof value.description === 'string' || value.description === null) &&
    isValidTimeString(value.startTime) &&
    isValidTimeString(value.endTime)
  );
}

/**
 * 응답 목록을 검증하고 시간 순서로 정렬한다.
 * @param payload 서버 성공 응답
 * @returns 일정 목록 또는 응답 형식 오류
 */
export function validateTimetableListResponse(
  payload: ApiSuccessResponse<TimetableResponse[]> | null,
): ApiResult<TimetableItem[]> {
  if (!Array.isArray(payload?.data) || !payload.data.every(isTimetableItem)) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '타임테이블 목록 응답 형식이 올바르지 않습니다.',
    };
  }
  const items: TimetableItem[] = [];
  for (const item of payload.data) {
    items.push({ ...item, description: item.description ?? '' });
  }
  return { ok: true, data: items.toSorted(compareTimetables) };
}

/**
 * 인증 토큰으로 타임테이블 목록을 요청한다.
 * @param accessToken 서버에서 읽은 액세스 토큰
 * @returns 일정 목록 또는 API 오류
 */
export function requestTimetableList(accessToken: string): Promise<ApiResult<TimetableItem[]>> {
  return requestServerApi<TimetableItem[]>(
    '/backoffice/api/v1/timetables',
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateTimetableListResponse,
  );
}

/**
 * 슈퍼 관리자 권한을 확인하고 일정 목록을 조회한다.
 * @returns 일정 목록 또는 인증 / 권한 오류
 */
export async function getTimetableList(): Promise<ApiResult<TimetableItem[]>> {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken)
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다. 다시 로그인해주세요.',
    };
  if (role !== 'SUPER_ADMIN')
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '타임테이블 관리 권한이 없습니다.',
    };
  return requestTimetableList(accessToken);
}

/**
 * 일정 식별자를 안전한 양의 정수로 검증한다.
 * @param timetableId 검증할 일정 식별자
 * @returns 유효한 식별자 또는 입력 오류
 */
export function validateTimetableId(timetableId: unknown): ApiResult<number> {
  const id =
    typeof timetableId === 'number'
      ? timetableId
      : typeof timetableId === 'string' && /^[1-9]\d*$/.test(timetableId)
        ? Number(timetableId)
        : NaN;
  if (!Number.isSafeInteger(id) || id <= 0)
    return {
      ok: false,
      status: 400,
      code: 'INVALID_INPUT',
      message: '유효하지 않은 일정 식별자입니다.',
    };
  return { ok: true, data: id };
}

/**
 * 인증 토큰으로 타임테이블 일정을 삭제한다.
 * @param accessToken 서버에서 읽은 액세스 토큰
 * @param timetableId 삭제할 일정 식별자
 * @returns 삭제 결과 또는 API 오류
 */
export function requestDeleteTimetable(
  accessToken: string,
  timetableId: number,
): Promise<ApiResult<null>> {
  return requestServerApi<null>(
    `/backoffice/api/v1/timetables/${encodeURIComponent(String(timetableId))}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'empty',
    },
  );
}

/**
 * 슈퍼 관리자 권한과 식별자를 확인하고 일정을 삭제한다.
 * @param timetableId 삭제할 일정 식별자
 * @returns 삭제 결과 또는 인증 / 권한 / 입력 오류
 */
export async function deleteTimetable(timetableId: unknown): Promise<ApiResult<null>> {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken)
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다. 다시 로그인해주세요.',
    };
  if (role !== 'SUPER_ADMIN')
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '타임테이블 관리 권한이 없습니다.',
    };
  const validated = validateTimetableId(timetableId);
  if (!validated.ok) return validated;
  return requestDeleteTimetable(accessToken, validated.data);
}

/** 타임테이블 일정 등록 요청 본문 */
export interface CreateTimetableRequest {
  /** 시작 일시 (HH:mm / ISO 일시) */
  startTime: string;
  /** 종료 일시 (HH:mm / ISO 일시) */
  endTime: string;
  /** 일정 제목 */
  title: string;
  /** 일정 상세 내용 */
  description: string;
  /** 현장 투표 진행 여부 */
  isVote?: boolean;
}

/**
 * 유효한 ISO 일시인지 확인한다.
 * @param value 검사할 값
 * @returns ISO 일시 여부
 */
export function isIsoDateTimeString(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

/**
 * 입력 시각을 행사일의 한국 현지 일시로 정규화한다.
 * @param value 시각 또는 ISO 일시
 * @returns 정규화된 행사 일시 또는 날짜 / 형식 불일치 시 null
 */
export function normalizeTimetableDateTime(value: string): string | null {
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
    return `${TIMETABLE_EVENT_DATE}T${value.slice(0, 5)}:00`;
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(
      value,
    ) ||
    !isIsoDateTimeString(value)
  )
    return null;
  let date = value.slice(0, 10);
  let time = value.slice(11, 16);
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(value)) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(value));
    const fields: Record<string, string> = {};
    for (const part of parts) fields[part.type] = part.value;
    date = `${fields.year}-${fields.month}-${fields.day}`;
    time = `${fields.hour}:${fields.minute}`;
  }
  return date === TIMETABLE_EVENT_DATE ? `${TIMETABLE_EVENT_DATE}T${time}:00` : null;
}

/**
 * 등록 요청을 검증하고 문자열을 정규화한다.
 * @param payload 등록 요청 본문
 * @returns 정규화된 입력 또는 검증 오류
 */
export function validateCreateTimetableInput(payload: unknown): ApiResult<CreateTimetableRequest> {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload))
    return invalidCreateInput('요청 본문 형식이 올바르지 않습니다.');
  const value = payload as Record<string, unknown>;
  if (typeof value.title !== 'string' || !value.title.trim())
    return invalidCreateInput('일정 제목을 입력해주세요.');
  if (value.title.trim().length > 100)
    return invalidCreateInput('일정 제목은 100자 이하로 입력해주세요.');
  if (typeof value.description !== 'string' || !value.description.trim())
    return invalidCreateInput('상세 내용을 입력해주세요.');
  if (value.isVote !== undefined && typeof value.isVote !== 'boolean')
    return invalidCreateInput('투표 여부 형식이 올바르지 않습니다.');
  if (!isValidTimeString(value.startTime) || !isValidTimeString(value.endTime))
    return invalidCreateInput('시작 시간과 종료 시간을 선택해주세요.');
  const startTime = normalizeTimetableDateTime(value.startTime);
  const endTime = normalizeTimetableDateTime(value.endTime);
  if (!startTime || !endTime)
    return invalidCreateInput('일정은 행사일 2026-11-21의 한국 시각으로 입력해주세요.');
  if (endTime <= startTime) return invalidCreateInput('종료 시간은 시작 시간보다 늦어야 합니다.');
  return {
    ok: true,
    data: {
      startTime,
      endTime,
      title: value.title.trim(),
      description: value.description.trim(),
      ...(typeof value.isVote === 'boolean' ? { isVote: value.isVote } : {}),
    },
  };
}

/**
 * 일정 등록 또는 수정 입력 오류를 생성한다.
 * @param message 오류 안내
 * @returns 입력 오류 결과
 */
function invalidCreateInput(message: string): ApiResult<never> {
  return { ok: false, status: 400, code: 'INVALID_INPUT', message };
}

/**
 * 인증 토큰으로 일정을 등록한다.
 * @param accessToken 액세스 토큰
 * @param body 검증된 등록 입력
 * @returns 등록 결과 또는 API 오류
 */
export function requestCreateTimetable(
  accessToken: string,
  body: CreateTimetableRequest,
): Promise<ApiResult<null>> {
  return requestServerApi<null>('/backoffice/api/v1/timetables', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  });
}

/**
 * 슈퍼 관리자 권한과 입력을 확인하고 일정을 등록한다.
 * @param payload 등록 요청 본문
 * @returns 등록 결과 또는 인증 / 입력 오류
 */
export async function createTimetable(payload: unknown): Promise<ApiResult<null>> {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken)
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다. 다시 로그인해주세요.',
    };
  if (role !== 'SUPER_ADMIN')
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '타임테이블 관리 권한이 없습니다.',
    };
  const validated = validateCreateTimetableInput(payload);
  if (!validated.ok) return validated;
  return requestCreateTimetable(accessToken, validated.data);
}

/** 타임테이블 일정 수정 요청 본문 */
export interface UpdateTimetableRequest {
  /** 일정 제목 */
  title: string;
  /** 일정 상세 내용 (미입력 시 null) */
  description: string | null;
  /** 시작 일시 (HH:mm / ISO 일시) */
  startTime: string;
  /** 종료 일시 (HH:mm / ISO 일시) */
  endTime: string;
}

/**
 * 등록과 동일한 날짜 정책을 적용해 입력 시각 또는 일시를 행사일의 한국 현지 일시로 정규화한다.
 * @param value 시각 또는 ISO 일시
 * @returns 정규화된 행사 일시 또는 날짜 / 형식 불일치 시 null
 */
function normalizeUpdateTimetableDateTime(value: string): string | null {
  return normalizeTimetableDateTime(value);
}

/**
 * 수정 요청 본문을 검증하고 문자열과 일시를 정규화한다.
 * @param payload 수정 요청 본문
 * @returns 정규화된 입력 또는 검증 오류
 */
export function validateUpdateTimetableInput(payload: unknown): ApiResult<UpdateTimetableRequest> {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload))
    return invalidCreateInput('요청 본문 형식이 올바르지 않습니다.');
  const value = payload as Record<string, unknown>;
  if (typeof value.title !== 'string' || !value.title.trim())
    return invalidCreateInput('일정 제목을 입력해주세요.');
  if (value.title.trim().length > 100)
    return invalidCreateInput('일정 제목은 100자 이하로 입력해주세요.');
  if (
    value.description !== undefined &&
    value.description !== null &&
    typeof value.description !== 'string'
  )
    return invalidCreateInput('상세 내용 형식이 올바르지 않습니다.');
  if (!isValidTimeString(value.startTime) || !isValidTimeString(value.endTime))
    return invalidCreateInput('시작 시간과 종료 시간을 선택해주세요.');
  const startTime = normalizeUpdateTimetableDateTime(value.startTime);
  const endTime = normalizeUpdateTimetableDateTime(value.endTime);
  if (!startTime || !endTime)
    return invalidCreateInput('시작 시간과 종료 시간 형식이 올바르지 않습니다.');
  if (timetableTimestamp(endTime) <= timetableTimestamp(startTime))
    return invalidCreateInput('종료 시간은 시작 시간보다 늦어야 합니다.');
  return {
    ok: true,
    data: {
      title: value.title.trim(),
      description: typeof value.description === 'string' ? value.description.trim() : null,
      startTime,
      endTime,
    },
  };
}

/**
 * 서버의 일정 수정 응답 본문을 검증하고 빈 설명을 기본값으로 보정한다.
 * @param payload 서버 성공 응답
 * @returns 수정된 일정 또는 응답 형식 오류
 */
export function validateUpdateTimetableResponse(
  payload: ApiSuccessResponse<TimetableResponse> | null,
): ApiResult<TimetableItem> {
  if (!isTimetableItem(payload?.data))
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '타임테이블 수정 응답 형식이 올바르지 않습니다.',
    };
  return { ok: true, data: { ...payload.data, description: payload.data.description ?? '' } };
}

/**
 * 인증 토큰으로 일정 수정을 요청한다.
 * @param accessToken 서버에서 읽은 액세스 토큰
 * @param timetableId 수정할 일정 식별자
 * @param body 검증된 수정 입력
 * @returns 수정된 일정 또는 API 오류
 */
export function requestUpdateTimetable(
  accessToken: string,
  timetableId: number,
  body: UpdateTimetableRequest,
): Promise<ApiResult<TimetableItem>> {
  return requestServerApi<TimetableItem, ApiErrorCode, TimetableResponse>(
    `/backoffice/api/v1/timetables/${encodeURIComponent(String(timetableId))}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    },
    validateUpdateTimetableResponse,
  );
}

/**
 * 슈퍼 관리자 권한과 식별자 / 입력을 확인하고 일정을 수정한다.
 * @param timetableId 수정할 일정 식별자
 * @param payload 수정 요청 본문
 * @returns 수정된 일정 또는 인증 / 권한 / 입력 오류
 */
export async function updateTimetable(
  timetableId: unknown,
  payload: unknown,
): Promise<ApiResult<TimetableItem>> {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken)
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다. 다시 로그인해주세요.',
    };
  if (role !== 'SUPER_ADMIN')
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '타임테이블 관리 권한이 없습니다.',
    };
  const validatedId = validateTimetableId(timetableId);
  if (!validatedId.ok) return validatedId;
  const validated = validateUpdateTimetableInput(payload);
  if (!validated.ok) return validated;
  return requestUpdateTimetable(accessToken, validatedId.data, validated.data);
}
