import { requestServerApi } from '@/lib/api/server-client';
import type { ApiResult, ApiSuccessResponse } from '@/lib/api/types';

export interface Project {
  id: number;
  title: string;
  serviceUrl: string | null;
  voteCount: number;
  teamName: string;
  teamNumber: number;
}

/** 프로젝트 목록 응답의 필수 필드를 확인합니다.
 * @param payload 서버의 성공 응답
 * @returns 검증된 프로젝트 목록 또는 형식 오류
 */
function validateProjectList(payload: ApiSuccessResponse<Project[]> | null): ApiResult<Project[]> {
  const projects = payload?.data;
  if (
    !Array.isArray(projects) ||
    !projects.every(
      /** 각 프로젝트의 필수 필드가 응답 계약에 맞는지 확인합니다.
       * @param project 검증할 프로젝트 항목
       * @returns 모든 필수 필드의 검증 통과 여부
       */
      function isValidProject(project) {
        return (
          project !== null &&
          typeof project === 'object' &&
          Number.isSafeInteger(project.id) &&
          typeof project.title === 'string' &&
          (typeof project.serviceUrl === 'string' || project.serviceUrl === null) &&
          Number.isSafeInteger(project.voteCount) &&
          project.voteCount >= 0 &&
          typeof project.teamName === 'string' &&
          Number.isSafeInteger(project.teamNumber)
        );
      },
    )
  ) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '프로젝트 목록 응답 형식이 올바르지 않습니다.',
    };
  }
  return { ok: true, data: projects };
}

/** 인증된 관리자 계정으로 프로젝트 목록을 조회합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param keyword 프로젝트명 검색어
 * @returns 프로젝트 목록 또는 API 오류
 */
export function requestProjectList(
  accessToken: string,
  keyword = '',
): Promise<ApiResult<Project[]>> {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  const search = params.toString();
  return requestServerApi<Project[]>(
    `/backoffice/api/v1/projects${search ? `?${search}` : ''}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateProjectList,
  );
}
