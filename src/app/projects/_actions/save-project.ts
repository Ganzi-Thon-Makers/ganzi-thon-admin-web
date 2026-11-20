'use server';

import { revalidatePath } from 'next/cache';

import { getServerAuthTokens } from '@/lib/auth/cookies';

import { requestProjectDetail } from '../_data/project-api';
import { getProjectFormSchema, type ProjectFormValues } from '../_data/project-form';
import { getMemberSelectionIssue } from '../_data/project-member-selection';
import { createProject, toProjectSaveRequest, updateProject } from '../_data/project-mutation-api';
import { requestProjectMemberCandidates } from '../_data/project-options-api';

export type ProjectSaveResult = { ok: true } | { ok: false; message: string };

/** 후보 API의 역할과 소속을 확인해 회원 변경 요청의 안전성을 검사합니다.
 * @param accessToken 관리자 인증 토큰
 * @param selectedIds 최종 선택된 참가자 ID
 * @param originalIds 상세 조회에 포함된 기존 팀원 ID
 * @param teamNumber 저장할 팀번호
 * @param projectId 수정 대상 ID, 등록에서는 없음
 * @returns 안전하면 성공, 아니면 안내 메시지
 */
async function validateMemberSelection(
  accessToken: string,
  selectedIds: number[],
  originalIds: number[],
  teamNumber: number,
  projectId?: number,
): Promise<ProjectSaveResult> {
  const result = await requestProjectMemberCandidates(accessToken);
  if (!result.ok)
    return { ok: false, message: '팀원 역할을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  const issue = getMemberSelectionIssue(
    result.data,
    selectedIds,
    originalIds,
    teamNumber,
    projectId,
  );
  if (issue) return { ok: false, message: issue };
  return { ok: true };
}

/** HTTP 실패를 프로젝트 저장 화면의 안내 문구로 변환합니다.
 * @param status 응답 상태 코드
 * @param message 서버 또는 공통 API 클라이언트의 메시지
 * @returns 화면 안내 문구
 */
function getSaveErrorMessage(status: number, message: string): string {
  if (status === 409) return '이미 사용 중인 팀번호입니다. 다른 번호를 선택해 주세요.';
  if (status === 400) return message || '입력값을 확인해 주세요.';
  if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
  if (status === 403) return '프로젝트 저장 권한이 없습니다.';
  if (status === 404) return '프로젝트를 찾을 수 없습니다.';
  return message || '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

/** 폼 값과 대표 이미지의 등록 규칙을 서버에서 다시 확인합니다.
 * @param values 클라이언트 폼 값
 * @param mode 등록 또는 수정
 * @param hasExistingThumbnail 기존 이미지 존재 여부
 * @returns 검증 결과
 */
function parseProjectValues(
  values: ProjectFormValues,
  mode: 'create' | 'edit',
  hasExistingThumbnail: boolean,
) {
  return getProjectFormSchema(mode, hasExistingThumbnail).safeParse(values);
}

/** 관리자 권한과 입력값을 확인한 뒤 프로젝트를 등록합니다.
 * @param values 등록 폼 값
 * @returns 저장 결과
 */
export async function createProjectAction(values: ProjectFormValues): Promise<ProjectSaveResult> {
  const { accessToken, role } = await getServerAuthTokens();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { ok: false, message: '등록 권한이 없습니다.' };
  if (!accessToken) return { ok: false, message: '다시 로그인해 주세요.' };
  const parsed = parseProjectValues(values, 'create', false);
  if (!parsed.success || !parsed.data.thumbnail)
    return { ok: false, message: '필수 입력값과 대표 이미지를 확인해 주세요.' };
  const members = await validateMemberSelection(
    accessToken,
    parsed.data.memberIds,
    [],
    parsed.data.teamNumber!,
  );
  if (!members.ok) return members;
  const request = toProjectSaveRequest(parsed.data, parsed.data.memberIds);
  const result = await createProject(accessToken, request, parsed.data.thumbnail);
  if (!result.ok) return { ok: false, message: getSaveErrorMessage(result.status, result.message) };
  revalidatePath('/projects');
  return { ok: true };
}

/** 현재 프로젝트와 회원 역할을 재조회하고 폼의 최종 참가자 목록을 저장합니다.
 * @param projectId 수정 대상 ID
 * @param values 수정 폼 값
 * @returns 저장 결과
 */
export async function updateProjectAction(
  projectId: number,
  values: ProjectFormValues,
): Promise<ProjectSaveResult> {
  const { accessToken, role } = await getServerAuthTokens();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { ok: false, message: '수정 권한이 없습니다.' };
  if (!accessToken) return { ok: false, message: '다시 로그인해 주세요.' };
  if (!Number.isSafeInteger(projectId) || projectId <= 0)
    return { ok: false, message: '프로젝트 ID를 확인해 주세요.' };
  const detail = await requestProjectDetail(accessToken, String(projectId));
  if (!detail.ok) return { ok: false, message: getSaveErrorMessage(detail.status, detail.message) };
  const parsed = parseProjectValues(values, 'edit', Boolean(detail.data.thumbnailUrl));
  if (!parsed.success) return { ok: false, message: '입력값을 확인해 주세요.' };
  const members = await validateMemberSelection(
    accessToken,
    parsed.data.memberIds,
    detail.data.members.map(
      /** 기존 팀원의 역할을 확인하기 위해 ID를 모읍니다.
       * @param member 상세 조회의 팀원
       * @returns 회원 ID
       */
      function toMemberId(member) {
        return member.userId;
      },
    ),
    parsed.data.teamNumber!,
    projectId,
  );
  if (!members.ok) return members;
  const request = toProjectSaveRequest(parsed.data, parsed.data.memberIds);
  const result = await updateProject(accessToken, projectId, request, parsed.data.thumbnail);
  if (!result.ok) return { ok: false, message: getSaveErrorMessage(result.status, result.message) };
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/edit`);
  return { ok: true };
}
