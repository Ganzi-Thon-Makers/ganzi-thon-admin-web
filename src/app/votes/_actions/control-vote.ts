'use server';

import { revalidatePath } from 'next/cache';

import { requestServerApi } from '@/lib/api/server-client';
import { getServerAuthTokens } from '@/lib/auth/cookies';

import { getVoteSchedule, type VoteSchedule } from '../_data/vote';

export interface VoteControlState {
  status: 'idle' | 'error' | 'success';
  message: string;
}

/**
 * 최고 관리자 권한과 현재 투표 상태를 검증한 뒤 투표를 일시중지하거나 재개한다.
 * @param _previousState 이전 투표 제어 처리 상태
 * @param formData 제어 의도(intent)가 포함된 폼 데이터
 * @returns 처리 결과 또는 사용자 안내 오류 상태
 */
export async function controlVoteAction(
  _previousState: VoteControlState,
  formData: FormData,
): Promise<VoteControlState> {
  const { role, accessToken } = await getServerAuthTokens();
  if (role !== 'SUPER_ADMIN' || !accessToken) {
    return { status: 'error', message: '투표를 제어할 권한이 없습니다. 다시 로그인해주세요.' };
  }

  const intent = formData.get('intent');
  if (intent !== 'pause' && intent !== 'resume') {
    return { status: 'error', message: '올바르지 않은 투표 제어 요청입니다.' };
  }

  const current = await getVoteSchedule();
  if (!current.ok) return { status: 'error', message: current.message };

  const canPause = current.data.status === 'IN_PROGRESS' && !current.data.paused;
  const canResume =
    current.data.status === 'PAUSED' ||
    (current.data.status === 'IN_PROGRESS' && current.data.paused);
  if ((intent === 'pause' && !canPause) || (intent === 'resume' && !canResume)) {
    return {
      status: 'error',
      message: '투표 상태가 변경되어 요청을 처리할 수 없습니다. 새로고침 후 다시 시도해주세요.',
    };
  }

  const result = await requestServerApi<VoteSchedule>(`/backoffice/api/v1/vote/${intent}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!result.ok) return { status: 'error', message: result.message };

  revalidatePath('/votes');
  return { status: 'success', message: '' };
}
