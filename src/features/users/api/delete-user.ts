import { requestServerApi } from '@/lib/api/server-client';

/** 인증된 참여자 삭제 요청을 백오피스 API로 전송합니다. */
export function deleteUser(userId: string, accessToken: string) {
  return requestServerApi<null>(`/backoffice/api/v1/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    baseUrlKey: 'backoffice',
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'empty',
  });
}
