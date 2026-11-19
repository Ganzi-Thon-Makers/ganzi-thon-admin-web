import 'server-only';

import { requestServerApi } from '@/lib/api/server-client';
import type { ApiResult, ApiSuccessResponse } from '@/lib/api/types';
import { getServerAuthTokens } from '@/lib/auth/cookies';

export type VoteStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'ENDED';

export interface VoteSchedule {
  startTime: string;
  endTime: string;
  paused: boolean;
  status: VoteStatus;
}

/**
 * 일정 응답의 필수 필드와 상태 / 날짜 값을 검증한다.
 * @param payload 서버가 반환한 투표 일정 응답
 * @returns 검증된 일정 또는 응답 형식 오류
 */
function validateVoteSchedule(
  payload: ApiSuccessResponse<VoteSchedule> | null,
): ApiResult<VoteSchedule> {
  const data = payload?.data;
  if (
    !data ||
    typeof data.startTime !== 'string' ||
    typeof data.endTime !== 'string' ||
    !Number.isFinite(Date.parse(data.startTime)) ||
    !Number.isFinite(Date.parse(data.endTime)) ||
    typeof data.paused !== 'boolean' ||
    !['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'ENDED'].includes(data.status)
  ) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '투표 일정 응답을 확인할 수 없습니다.',
    };
  }
  return { ok: true, data };
}

/**
 * 최고 관리자 인증 토큰으로 현재 투표 일정을 조회한다.
 * @returns 투표 일정 또는 인증 / 통신 오류
 */
export async function getVoteSchedule(): Promise<ApiResult<VoteSchedule>> {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken || role !== 'SUPER_ADMIN') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '투표 일정을 조회할 권한이 없습니다. 다시 로그인해주세요.',
    };
  }
  return requestServerApi<VoteSchedule>(
    '/backoffice/api/v1/vote',
    { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
    validateVoteSchedule,
  );
}
