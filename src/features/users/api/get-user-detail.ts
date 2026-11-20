import { requestServerApi } from '@/lib/api/server-client';

import type { User } from '../types/user';

interface UserDetailResponse {
  id: number;
  loginId: string;
  role: string;
  name: string;
  school: string;
  phoneNumber: string;
  teamNumber: number;
  part: string;
  luckyDrawEntered: boolean;
  completed: boolean;
}

type UserDetailResult = { ok: true; user: User } | { ok: false; status: number };

/** 참여자 상세 정보를 조회하고 기존 상세 화면의 데이터 형식으로 변환합니다.
 * @param userId 조회할 사용자 ID
 * @param accessToken 관리자 인증 토큰
 * @returns 변환된 참여자 정보 또는 조회 실패 상태
 */
export async function getUserDetail(
  userId: string,
  accessToken: string,
): Promise<UserDetailResult> {
  const result = await requestServerApi<UserDetailResponse>(
    `/backoffice/api/v1/users/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!result.ok) return { ok: false, status: result.status };

  const data = result.data;
  if (
    !data ||
    data.role !== 'PARTICIPANT' ||
    !Number.isSafeInteger(data.id) ||
    !Number.isSafeInteger(data.teamNumber) ||
    typeof data.loginId !== 'string' ||
    typeof data.name !== 'string' ||
    typeof data.school !== 'string' ||
    typeof data.phoneNumber !== 'string' ||
    typeof data.part !== 'string' ||
    typeof data.luckyDrawEntered !== 'boolean' ||
    typeof data.completed !== 'boolean'
  ) {
    return { ok: false, status: 502 };
  }

  return {
    ok: true,
    user: {
      id: String(data.id),
      accountId: data.loginId,
      name: data.name,
      school: data.school,
      phoneNumber: data.phoneNumber,
      teamNumber: String(data.teamNumber).padStart(2, '0'),
      part: data.part,
      hasEnteredLuckyDraw: data.luckyDrawEntered,
      hasCompletedCourse: data.completed,
    },
  };
}
