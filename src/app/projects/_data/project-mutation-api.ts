import { requestServerApi } from '@/lib/api/server-client';

import type { ProjectFormValues } from './project-form';
import { normalizeProjectServiceUrl } from './project-url';

/** 프로젝트 저장 API에 전달하는 JSON 파트입니다. */
export interface ProjectSaveRequest {
  title: string;
  serviceUrl: string | null;
  teamName: string;
  teamNumber: number;
  memberIds: number[];
  techStack: string;
  summary: string;
  description: string;
  platform: 'WEB' | 'APP';
}

/** 검증된 폼 값을 서버 요청의 JSON 파트로 옮깁니다.
 * @param values 검증된 폼 값
 * @param memberIds 전송할 최종 참가자 ID 목록
 * @returns 프로젝트 저장 요청
 */
export function toProjectSaveRequest(
  values: ProjectFormValues,
  memberIds: number[],
): ProjectSaveRequest {
  if (values.teamNumber === null || values.platform === null)
    throw new Error('필수 입력값을 확인해 주세요.');
  const serviceUrl = normalizeProjectServiceUrl(values.serviceUrl);
  if (values.serviceUrl.trim() && (!serviceUrl || serviceUrl.length > 500))
    throw new Error('서비스 URL을 확인해 주세요.');
  return {
    title: values.title,
    serviceUrl,
    teamName: values.teamName,
    teamNumber: values.teamNumber,
    memberIds,
    techStack: values.techStack,
    summary: values.summary,
    description: values.description,
    platform: values.platform,
  };
}

/** JSON request 파트와 선택한 이미지를 multipart 본문에 담습니다.
 * @param request 프로젝트 저장 요청
 * @param thumbnail 새 대표 이미지
 * @returns multipart 요청 본문
 */
export function toProjectFormData(request: ProjectSaveRequest, thumbnail: File | null): FormData {
  const body = new FormData();
  body.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  if (thumbnail) body.append('thumbnail', thumbnail);
  return body;
}

/** 인증된 프로젝트 등록 요청을 전송합니다.
 * @param accessToken 관리자 인증 토큰
 * @param request 등록 요청 JSON
 * @param thumbnail 필수 대표 이미지
 * @returns API 결과
 */
export function createProject(accessToken: string, request: ProjectSaveRequest, thumbnail: File) {
  return requestServerApi<null>('/backoffice/api/v1/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: toProjectFormData(request, thumbnail),
    responseType: 'empty',
  });
}

/** 인증된 프로젝트 수정 요청을 전송합니다.
 * @param accessToken 관리자 인증 토큰
 * @param projectId 수정 대상 ID
 * @param request 수정 요청 JSON
 * @param thumbnail 새 이미지 또는 기존 이미지 유지
 * @returns API 결과
 */
export function updateProject(
  accessToken: string,
  projectId: number,
  request: ProjectSaveRequest,
  thumbnail: File | null,
) {
  return requestServerApi<null>(`/backoffice/api/v1/projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: toProjectFormData(request, thumbnail),
    responseType: 'empty',
  });
}
