'use server';

import { revalidatePath } from 'next/cache';

import { getServerAuthTokens } from '@/lib/auth/cookies';

import { requestProjectDetail } from '../_data/project-api';
import { getProjectFormSchema, type ProjectFormValues } from '../_data/project-form';
import { createProject, toProjectSaveRequest, updateProject } from '../_data/project-mutation-api';
import { requestProjectMemberCandidates } from '../_data/project-options-api';

export type ProjectSaveResult = { ok: true } | { ok: false; message: string };

/** 두 회원 ID 목록이 순서와 관계없이 같은지 확인합니다.
 * @param first 첫 번째 목록
 * @param second 두 번째 목록
 * @returns 동일 여부
 */
function haveSameMemberIds(first: number[], second: number[]): boolean {
  return first.length === second.length && first.every((id) => second.includes(id));
}

/** 후보 API의 역할과 소속을 확인해 회원 변경 요청의 안전성을 검사합니다.
 * @param accessToken 관리자 인증 토큰
 * @param selectedIds 최종 선택된 회원 ID
 * @param originalIds 기존 회원 ID
 * @param projectId 수정 대상 ID, 등록에서는 없음
 * @returns 안전하면 성공, 아니면 안내 메시지
 */
async function validateMemberSelection(
  accessToken: string,
  selectedIds: number[],
  originalIds: number[],
  projectId?: number,
): Promise<ProjectSaveResult> {
  if (new Set(selectedIds).size !== selectedIds.length)
    return { ok: false, message: '중복된 팀원이 선택되었습니다.' };
  const result = await requestProjectMemberCandidates(accessToken);
  if (!result.ok)
    return { ok: false, message: '팀원 역할을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  const byId = new Map(result.data.map((candidate) => [candidate.userId, candidate]));
  const allIds = [...new Set([...originalIds, ...selectedIds])];
  if (allIds.some((id) => !byId.has(id)))
    return {
      ok: false,
      message: '기존 팀원의 역할을 확인할 수 없어 팀원 변경을 저장할 수 없습니다.',
    };
  if (
    selectedIds.some((id) => {
      const owner = byId.get(id)?.projectId;
      return owner === undefined || (owner !== null && owner !== projectId);
    })
  )
    return { ok: false, message: '다른 프로젝트 소속이거나 소속을 확인할 수 없는 팀원입니다.' };
  const selectedTeams = selectedIds.filter((id) => byId.get(id)?.role === 'TEAM');
  if (selectedTeams.length > 1)
    return { ok: false, message: '팀 계정은 한 개만 선택할 수 있습니다.' };
  const originalTeam = originalIds.find((id) => byId.get(id)?.role === 'TEAM');
  if (originalTeam && !selectedIds.includes(originalTeam) && selectedTeams.length === 0)
    return {
      ok: false,
      message: '기존 팀 계정은 삭제할 수 없습니다. 교체할 팀 계정을 선택해 주세요.',
    };
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
  if (parsed.data.memberIds.length > 0) {
    const members = await validateMemberSelection(accessToken, parsed.data.memberIds, []);
    if (!members.ok) return members;
  }
  const request = toProjectSaveRequest(parsed.data, parsed.data.memberIds);
  const result = await createProject(accessToken, request, parsed.data.thumbnail);
  if (!result.ok) return { ok: false, message: getSaveErrorMessage(result.status, result.message) };
  revalidatePath('/projects');
  return { ok: true };
}

/** 현재 프로젝트와 회원 역할을 재조회한 뒤 안전한 변경만 저장합니다.
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
  const originalIds = detail.data.members.map((member) => member.userId);
  const membersChanged = !haveSameMemberIds(originalIds, parsed.data.memberIds);
  if (membersChanged) {
    const members = await validateMemberSelection(
      accessToken,
      parsed.data.memberIds,
      originalIds,
      projectId,
    );
    if (!members.ok) return members;
  }
  const request = toProjectSaveRequest(
    parsed.data,
    membersChanged ? parsed.data.memberIds : undefined,
  );
  const result = await updateProject(accessToken, projectId, request, parsed.data.thumbnail);
  if (!result.ok) return { ok: false, message: getSaveErrorMessage(result.status, result.message) };
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/edit`);
  return { ok: true };
}
