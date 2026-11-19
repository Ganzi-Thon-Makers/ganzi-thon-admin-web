import { requestServerApi } from '@/lib/api/server-client';

import type { EditValues } from '../validation/user-edit';

/** 사용자 수정 API의 전체 교체 요청입니다. */
export interface UpdateUserRequest {
  loginId: string;
  name: string;
  school: string;
  phoneNumber: string;
  teamNumber: number;
  part: string;
  password?: string;
}

/** 검증된 폼 값을 PUT 요청 형식으로 변환합니다.
 * @param values 검증을 통과한 수정 폼 값
 * @returns 비밀번호가 비어 있으면 해당 필드를 제외한 전체 교체 요청 본문
 */
export function toUpdateUserRequest(values: EditValues): UpdateUserRequest {
  return {
    loginId: values.accountId,
    name: values.name,
    school: values.school,
    phoneNumber: values.phoneNumber,
    teamNumber: Number(values.teamNumber),
    part: values.part,
    ...(values.password ? { password: values.password } : {}),
  };
}

/** 서버에서 인증된 사용자 정보 수정 요청을 전송합니다.
 * @param userId 수정할 사용자 ID
 * @param accessToken 관리자 인증 토큰
 * @param values 검증을 통과한 수정 폼 값
 * @returns 수정 성공 여부와 실패 시 오류 정보
 */
export function updateUser(userId: string, accessToken: string, values: EditValues) {
  return requestServerApi<null>(`/backoffice/api/v1/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: toUpdateUserRequest(values),
    responseType: 'empty',
  });
}
