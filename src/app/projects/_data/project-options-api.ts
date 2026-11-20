import { requestServerApi } from '@/lib/api/server-client';
import type { ApiResult, ApiSuccessResponse } from '@/lib/api/types';

import type { ProjectMemberOption, ProjectTeamOption } from './project-form';

/** 팀 목록 응답의 필수 필드를 검사합니다.
 * @param payload 서버 응답
 * @returns 검증한 목록 또는 오류
 */
function validateTeams(
  payload: ApiSuccessResponse<ProjectTeamOption[]> | null,
): ApiResult<ProjectTeamOption[]> {
  if (
    !Array.isArray(payload?.data) ||
    !payload.data.every(
      /** 팀 항목의 필수값을 확인합니다.
       * @param team 검사할 팀
       * @returns 유효한 팀 여부
       */
      function isValidTeam(team) {
        return (
          Number.isInteger(team?.teamNumber) &&
          team.teamNumber >= 1 &&
          team.teamNumber <= 30 &&
          typeof team.teamName === 'string' &&
          Number.isSafeInteger(team.projectId)
        );
      },
    )
  )
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '팀 목록 응답 형식이 올바르지 않습니다.',
    };
  return { ok: true, data: payload.data };
}

/** 인증된 관리자 권한으로 팀 목록을 조회합니다.
 * @param accessToken 관리자 토큰
 * @returns 팀 목록 또는 오류
 */
export function requestProjectTeams(accessToken: string): Promise<ApiResult<ProjectTeamOption[]>> {
  return requestServerApi<ProjectTeamOption[]>(
    '/backoffice/api/v1/projects/teams',
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateTeams,
  );
}

/** 회원 후보 응답의 필수 필드를 검사합니다.
 * @param payload 서버 응답
 * @returns 검증한 후보 목록 또는 오류
 */
function validateCandidates(
  payload: ApiSuccessResponse<ProjectMemberOption[]> | null,
): ApiResult<ProjectMemberOption[]> {
  if (
    !Array.isArray(payload?.data) ||
    !payload.data.every(
      /** 후보 항목의 필수값을 확인합니다.
       * @param member 검사할 후보
       * @returns 유효한 후보 여부
       */
      function isValidCandidate(member) {
        return (
          Number.isSafeInteger(member?.userId) &&
          typeof member.name === 'string' &&
          typeof member.loginId === 'string' &&
          ['PARTICIPANT', 'TEAM'].includes(member.role) &&
          (member.part === null ||
            ['PLAN', 'DESIGN', 'WEB', 'APP', 'SERVER'].includes(member.part)) &&
          (member.teamNumber === null || Number.isInteger(member.teamNumber)) &&
          (member.projectId === null ||
            member.projectId === undefined ||
            Number.isSafeInteger(member.projectId))
        );
      },
    )
  )
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '팀원 후보 응답 형식이 올바르지 않습니다.',
    };
  return { ok: true, data: payload.data };
}

/** 인증된 관리자 권한으로 이름에 맞는 후보를 조회합니다.
 * @param accessToken 관리자 토큰
 * @param keyword 이름 검색어
 * @returns 후보 목록 또는 오류
 */
export function requestProjectMemberCandidates(
  accessToken: string,
  keyword = '',
): Promise<ApiResult<ProjectMemberOption[]>> {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  const search = params.toString();
  return requestServerApi<ProjectMemberOption[]>(
    `/backoffice/api/v1/projects/member-candidates${search ? `?${search}` : ''}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateCandidates,
  );
}
