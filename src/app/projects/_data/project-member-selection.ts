import type { ProjectMemberOption } from './project-form';

/** 최종 참가자 목록의 역할, 소속, 팀번호를 확인합니다.
 * @param candidates 후보 API의 전체 응답
 * @param selectedIds 폼에서 최종 선택한 참가자 ID
 * @param originalIds 프로젝트 상세 조회의 기존 팀원 ID
 * @param teamNumber 저장할 팀번호
 * @param projectId 수정 대상 프로젝트 ID, 등록에서는 없음
 * @returns 저장을 막아야 할 이유 또는 null
 */
export function getMemberSelectionIssue(
  candidates: ProjectMemberOption[],
  selectedIds: number[],
  originalIds: number[],
  teamNumber: number | null,
  projectId?: number,
): string | null {
  if (new Set(selectedIds).size !== selectedIds.length) return '중복된 팀원이 선택되었습니다.';

  const byId = new Map<number, ProjectMemberOption>();
  for (const candidate of candidates) byId.set(candidate.userId, candidate);
  for (const id of originalIds) {
    if (!byId.has(id)) return '기존 팀원의 역할을 확인할 수 없어 저장할 수 없습니다.';
  }
  const originalSet = new Set(originalIds);
  for (const id of selectedIds) {
    const candidate = byId.get(id);
    if (!candidate) return '선택한 팀원의 정보를 확인할 수 없어 저장할 수 없습니다.';
    if (candidate.role !== 'PARTICIPANT') return '참가자 계정만 선택할 수 있습니다.';
    if (
      candidate.projectId === undefined ||
      (candidate.projectId !== null &&
        (projectId === undefined || candidate.projectId !== projectId))
    )
      return '다른 프로젝트 소속이거나 소속을 확인할 수 없는 팀원입니다.';
    if (!originalSet.has(id) && candidate.teamNumber !== teamNumber)
      return '새로 추가한 참가자의 팀번호가 선택한 팀번호와 다릅니다.';
  }

  return null;
}
