import { requestServerApi } from '@/lib/api/server-client';

import type { CreateValues } from '../validation/user-create';

/** 역할별 필드만 포함하는 등록 요청 본문을 만듭니다.
 * @param values 검증된 등록 입력값
 * @returns 백엔드에 전달할 역할별 요청 본문
 */
export function toCreateUserRequest(values: CreateValues) {
  const credentials = { role: values.role, loginId: values.accountId, password: values.password };
  if (values.role === 'TEAM') return { ...credentials, teamNumber: Number(values.teamNumber) };
  const identity = {
    ...credentials,
    name: values.name,
    school: values.school,
    phoneNumber: values.phoneNumber,
  };
  if (values.role === 'ADMIN')
    return { ...identity, ...(values.part ? { part: values.part } : {}) };
  return { ...identity, teamNumber: Number(values.teamNumber), part: values.part };
}

/** 인증 토큰을 사용해 사용자 등록 API를 호출합니다.
 * @param accessToken 관리자 인증 토큰
 * @param values 검증된 등록 입력값
 * @returns 등록 성공 데이터 또는 API 오류 결과
 */
export function createUser(accessToken: string, values: CreateValues) {
  return requestServerApi<null>('/backoffice/api/v1/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: toCreateUserRequest(values),
    responseType: 'empty',
  });
}
