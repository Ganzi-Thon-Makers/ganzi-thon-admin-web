import { requestServerApi } from '@/lib/api/server-client';

/** 인증된 참여자 삭제 요청을 백오피스 API로 전송합니다.
 * @param userId 삭제할 사용자 ID
 * @param accessToken 관리자 인증 토큰
 * @returns 삭제 성공 여부와 실패 시 오류 정보
 */
export function deleteUser(userId: string, accessToken: string) {
  return requestServerApi<null>(`/backoffice/api/v1/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'empty',
  });
}
