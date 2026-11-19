import 'server-only';

import { requestServerApi } from '@/lib/api/server-client';
import type { ApiResult, ApiSuccessResponse } from '@/lib/api/types';
import { getServerAuthTokens } from '@/lib/auth/cookies';

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
 * 시간을 정렬 가능한 값으로 변환합니다.
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
 * 지원하는 시간 형식과 유효한 시각인지 확인합니다.
 * @param value 검증할 시간
 * @returns 시간 유효 여부
 */
export function isValidTimeString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) return true;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && Number.isFinite(Date.parse(value));
}

/**
 * 시작 시간 / 종료 시간 / 식별자 순으로 비교합니다.
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

/**
 * 목록 항목이 표시 가능한 일정인지 확인합니다.
 * @param item 검증할 응답 항목
 * @returns 일정 형식 일치 여부
 */
function isTimetableItem(item: unknown): item is TimetableItem {
  if (item === null || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  return (
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isValidTimeString(value.startTime) &&
    isValidTimeString(value.endTime)
  );
}

/**
 * 응답 목록을 검증하고 시간 순서로 정렬합니다.
 * @param payload 서버 성공 응답
 * @returns 일정 목록 또는 응답 형식 오류
 */
export function validateTimetableListResponse(
  payload: ApiSuccessResponse<TimetableItem[]> | null,
): ApiResult<TimetableItem[]> {
  if (!Array.isArray(payload?.data) || !payload.data.every(isTimetableItem)) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '타임테이블 목록 응답 형식이 올바르지 않습니다.',
    };
  }
  return { ok: true, data: payload.data.toSorted(compareTimetables) };
}

/**
 * 인증 토큰으로 타임테이블 목록을 요청합니다.
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
 * 슈퍼 관리자 권한을 확인하고 일정 목록을 조회합니다.
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
