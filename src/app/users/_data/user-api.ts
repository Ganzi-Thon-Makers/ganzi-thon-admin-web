import type { UserTableItem } from '@/app/users/_components/user-table';
import { requestServerApi } from '@/lib/api/server-client';
import type { ApiErrorCode, ApiResult, ApiSuccessResponse } from '@/lib/api/types';

interface UserListResponseItem {
  id: number;
  name: string;
  school: string;
  phoneNumber: string;
  luckyDrawEntered: boolean;
  completed: boolean;
  teamNumber: number;
}

export interface UserListQuery {
  keyword?: string;
  luckyDrawEntered?: boolean;
  completed?: boolean;
}

/** Swagger 응답 항목을 기존 목록 화면의 표시 데이터로 변환합니다.
 * @param user API가 반환한 사용자
 * @returns 테이블에서 사용하는 사용자 정보
 */
function toUserTableItem(user: UserListResponseItem): UserTableItem {
  return {
    id: String(user.id),
    name: user.name,
    school: user.school,
    phoneNumber: user.phoneNumber,
    hasEnteredLuckyDraw: user.luckyDrawEntered,
    hasCompletedCourse: user.completed,
    teamNumber: String(user.teamNumber).padStart(2, '0'),
  };
}

/** 사용자 목록 응답 형식을 확인한 뒤 테이블 데이터로 변환합니다.
 * @param payload 서버의 성공 응답
 * @returns 변환된 목록 또는 응답 형식 오류
 */
function validateUserListResponse(
  payload: ApiSuccessResponse<UserListResponseItem[]> | null,
): ApiResult<UserTableItem[]> {
  const users = payload?.data;
  if (
    !Array.isArray(users) ||
    !users.every(
      (user) =>
        user !== null &&
        typeof user === 'object' &&
        typeof user.id === 'number' &&
        typeof user.name === 'string' &&
        typeof user.school === 'string' &&
        typeof user.phoneNumber === 'string' &&
        typeof user.luckyDrawEntered === 'boolean' &&
        typeof user.completed === 'boolean' &&
        typeof user.teamNumber === 'number',
    )
  ) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '사용자 목록 응답 형식이 올바르지 않습니다.',
    };
  }

  return { ok: true, data: users.map(toUserTableItem) };
}

/** 인증된 관리자 계정으로 전체 참여자 목록을 조회합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param query 선택한 이름 및 상태 조건
 * @returns 사용자 목록 또는 API 오류
 */
export function requestUserList(
  accessToken: string,
  query: UserListQuery = {},
): Promise<ApiResult<UserTableItem[]>> {
  const params = new URLSearchParams();
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.luckyDrawEntered !== undefined)
    params.set('luckyDrawEntered', String(query.luckyDrawEntered));
  if (query.completed !== undefined) params.set('completed', String(query.completed));
  const search = params.toString();
  const endpoint = `/backoffice/api/v1/users${search ? `?${search}` : ''}`;

  return requestServerApi<UserTableItem[], ApiErrorCode, UserListResponseItem[]>(
    endpoint,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateUserListResponse,
  );
}
