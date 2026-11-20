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

export type ProjectPart = 'PLAN' | 'DESIGN' | 'WEB' | 'APP' | 'SERVER';

export interface ProjectMember {
  userId: number;
  part: ProjectPart;
  name: string;
}

export interface ProjectDetail extends Project {
  thumbnailUrl: string;
  members: ProjectMember[];
  techStack: string;
  summary: string;
  description: string;
  platform: 'WEB' | 'APP';
}

/** 프로젝트 상세 응답의 필드와 참여자 형식을 검증합니다.
 * @param payload 서버의 성공 응답
 * @returns 검증된 상세 정보 또는 응답 형식 오류
 */
function validateProjectDetail(
  payload: ApiSuccessResponse<ProjectDetail> | null,
): ApiResult<ProjectDetail> {
  const detail = payload?.data;
  const parts: ProjectPart[] = ['PLAN', 'DESIGN', 'WEB', 'APP', 'SERVER'];
  if (
    !detail ||
    typeof detail !== 'object' ||
    !Number.isSafeInteger(detail.id) ||
    typeof detail.title !== 'string' ||
    typeof detail.thumbnailUrl !== 'string' ||
    (typeof detail.serviceUrl !== 'string' && detail.serviceUrl !== null) ||
    !Number.isSafeInteger(detail.voteCount) ||
    detail.voteCount < 0 ||
    typeof detail.teamName !== 'string' ||
    !Number.isSafeInteger(detail.teamNumber) ||
    !Array.isArray(detail.members) ||
    !detail.members.every(
      /** 참여자 필드와 파트를 확인합니다.
       * @param member 검증할 참여자
       * @returns 유효한 참여자인지 여부
       */
      function isValidMember(member: ProjectMember) {
        return (
          member !== null &&
          typeof member === 'object' &&
          Number.isSafeInteger(member.userId) &&
          parts.includes(member.part) &&
          typeof member.name === 'string'
        );
      },
    ) ||
    typeof detail.techStack !== 'string' ||
    typeof detail.summary !== 'string' ||
    typeof detail.description !== 'string' ||
    (detail.platform !== 'WEB' && detail.platform !== 'APP')
  ) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '프로젝트 상세 응답 형식이 올바르지 않습니다.',
    };
  }
  return { ok: true, data: detail };
}

/** 인증된 프로젝트 상세 정보를 조회합니다.
 * @param accessToken 서버 쿠키의 액세스 토큰
 * @param projectId 조회할 프로젝트 ID
 * @returns 상세 정보 또는 API 오류
 */
export function requestProjectDetail(
  accessToken: string,
  projectId: string,
): Promise<ApiResult<ProjectDetail>> {
  return requestServerApi<ProjectDetail>(
    `/backoffice/api/v1/projects/${encodeURIComponent(projectId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateProjectDetail,
  );
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
