'use server';

import { revalidatePath } from 'next/cache';

import { requestServerApi } from '@/lib/api/server-client';
import { getServerAuthTokens } from '@/lib/auth/cookies';

import { getVoteSchedule } from '../_data/vote';

export interface VoteTimeState {
  status: 'idle' | 'error' | 'success';
  message: string;
}

/**
 * 기준 일정의 한국 날짜와 입력 시각을 결합한다.
 * @param originalTime 기준 일정의 ISO 일시 문자열
 * @param time 사용자가 입력한 HH:mm 형식 시각
 * @returns 동일한 한국 날짜를 유지하는 ISO 일시 문자열
 */
function combineKoreanTime(originalTime: string, time: string): string {
  const koreanDate = new Date(Date.parse(originalTime) + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return new Date(`${koreanDate}T${time}:00+09:00`).toISOString();
}

/**
 * 최고 관리자 권한과 시간 순서를 확인한 뒤 투표 시간을 수정한다.
 * @param _previousState 이전 폼 처리 상태
 * @param formData 시작 / 마감 시각 폼 데이터
 * @returns 수정 성공 또는 사용자에게 표시할 오류 상태
 */
export async function updateVoteTimeAction(
  _previousState: VoteTimeState,
  formData: FormData,
): Promise<VoteTimeState> {
  const { role, accessToken } = await getServerAuthTokens();
  if (role !== 'SUPER_ADMIN' || !accessToken) {
    return { status: 'error', message: '시간을 수정할 권한이 없습니다. 다시 로그인해주세요.' };
  }

  const start = formData.get('startTime');
  const end = formData.get('endTime');
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    typeof start !== 'string' ||
    typeof end !== 'string' ||
    !timePattern.test(start) ||
    !timePattern.test(end)
  ) {
    return { status: 'error', message: '시작 시간과 마감 시간을 HH:mm 형식으로 입력해주세요.' };
  }

  const current = await getVoteSchedule();
  if (!current.ok) return { status: 'error', message: current.message };
  if (current.data.status === 'IN_PROGRESS' && !current.data.paused) {
    return { status: 'error', message: '투표 진행 중에는 시간을 수정할 수 없습니다.' };
  }

  const startTime = combineKoreanTime(current.data.startTime, start);
  const endTime = combineKoreanTime(current.data.endTime, end);
  if (Date.parse(startTime) >= Date.parse(endTime)) {
    return {
      status: 'error',
      message: '시작 시간이 마감 시간보다 늦습니다. 시간을 다시 확인해주세요.',
    };
  }

  const result = await requestServerApi<null>('/backoffice/api/v1/vote/time', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { startTime, endTime },
    responseType: 'empty',
  });
  if (!result.ok) return { status: 'error', message: result.message };

  revalidatePath('/votes');
  return { status: 'success', message: '' };
}
