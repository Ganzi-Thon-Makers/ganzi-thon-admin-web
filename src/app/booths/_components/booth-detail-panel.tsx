'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useId, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  type AssignableProjectItem,
  type BoothItem,
  fetchAssignableProjects,
  parseBoothApiJsonSafely,
} from '../_data/booths';

export interface BoothDetailPanelProps {
  /** 현재 선택된 구역 표시 이름 */
  zoneLabel: string;
  /** 현재 선택된 부스가 속한 호실 이름 */
  roomName: string;
  /** 현재 선택된 부스 정보 */
  booth: BoothItem;
}

/**
 * 패널에서 선택 가능한 팀의 표시 문자열을 생성합니다.
 * @param project 배정 가능 프로젝트 정보
 * @returns `01팀 / 팀명` 형식의 표시 문자열
 */
function formatPanelTeamLabel(project: AssignableProjectItem): string {
  const displayName = project.teamName || project.projectName;
  if (project.teamNumber && displayName) {
    return `${project.teamNumber}팀 / ${displayName}`;
  }
  if (project.teamNumber) {
    return `${project.teamNumber}팀`;
  }
  return displayName || `프로젝트 #${project.projectId}`;
}

/**
 * 미배정 부스에 팀을 배정하고, 배정 완료 후 상태를 우측 패널에 반영합니다.
 */
export function BoothDetailPanel({ zoneLabel, roomName, booth }: BoothDetailPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const teamSelectId = useId();
  const submittingRef = useRef(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [assignedProject, setAssignedProject] = useState<AssignableProjectItem | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isAssignedFromBooth = booth.projectId !== undefined;
  const isAssigned = isAssignedFromBooth || assignedProject !== null;

  /**
   * TanStack Query를 통해 미배정 부스에 배정 가능한 팀 목록을 조회합니다.
   * @param context 요청 취소 신호 객체
   * @returns 배정 가능한 프로젝트 목록
   */
  function queryAssignableProjects({ signal }: { signal: AbortSignal }) {
    return fetchAssignableProjects(booth.boothId, signal);
  }

  const {
    data: assignableProjects = [],
    error: projectsError,
    isPending: isProjectsPending,
    isFetching: isProjectsFetching,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['booth-assignable-projects', booth.boothId],
    queryFn: queryAssignableProjects,
    enabled: !isAssigned,
    staleTime: 30_000,
    retry: false,
  });

  const isLoadingProjects = !isAssigned && (isProjectsPending || isProjectsFetching);
  const projectsErrorMessage = !isAssigned ? projectsError?.message : undefined;
  const locationText = `${zoneLabel} · ${roomName}`;

  const assignedTeamLabel = assignedProject
    ? formatPanelTeamLabel(assignedProject)
    : isAssignedFromBooth && booth.teamNumber
      ? `${booth.teamNumber}팀 / ${booth.teamName || booth.projectName || '배정 프로젝트'}`
      : '배정된 팀 없음';

  const assignedTeamValue = assignedProject
    ? String(assignedProject.projectId)
    : isAssignedFromBooth
      ? String(booth.projectId)
      : '';

  /**
   * 드롭다운 트리거에 표시할 팀 이름 또는 안내 문구를 반환합니다.
   * @param value 선택된 프로젝트 식별자 문자열
   * @returns 트리거에 표시할 문자열
   */
  function renderSelectDisplayValue(value: string | null): string {
    if (isAssigned) {
      return assignedTeamLabel;
    }
    if (isLoadingProjects && assignableProjects.length === 0) {
      return '배정 가능한 팀을 불러오는 중입니다...';
    }
    if (!value) {
      return '미배정 팀 선택';
    }

    /**
     * 선택된 프로젝트 식별자와 일치하는 배정 가능 팀을 찾습니다.
     * @param project 배정 가능 프로젝트 항목
     * @returns 프로젝트 식별자 일치 여부
     */
    function matchesSelectedProject(project: AssignableProjectItem): boolean {
      return String(project.projectId) === value;
    }

    const matched = assignableProjects.find(matchesSelectedProject);
    return matched ? formatPanelTeamLabel(matched) : '미배정 팀 선택';
  }

  /**
   * 배정할 팀 선택 변경을 상태에 반영합니다.
   * @param nextValue 선택된 프로젝트 식별자 문자열
   */
  function handleProjectSelectChange(nextValue: string | null) {
    if (nextValue === null) return;
    setSelectedProjectId(nextValue);
    setSaveErrorMessage('');
  }

  /**
   * 배정 가능한 팀 목록 조회 실패 시 다시 요청합니다.
   */
  function handleRetryProjects() {
    setSaveErrorMessage('');
    void refetchProjects();
  }

  /**
   * 선택한 팀을 현재 미배정 부스에 저장하고 목록 / 배정 가능 팀 캐시를 갱신합니다.
   * @param event 폼 제출 이벤트
   */
  async function handleAssignSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || isAssigned || !selectedProjectId) return;

    const projectId = Number(selectedProjectId);
    if (!Number.isSafeInteger(projectId) || projectId < 0) {
      setSaveErrorMessage('유효한 팀을 선택해주세요.');
      return;
    }

    submittingRef.current = true;
    setIsSaving(true);
    setSaveErrorMessage('');

    try {
      const response = await fetch(
        `/api/booths/${encodeURIComponent(String(booth.boothId))}/project`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        },
      );

      if (!response.ok) {
        const payload = await parseBoothApiJsonSafely(response);
        setSaveErrorMessage(
          payload?.message || '팀 배정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
        );
        return;
      }

      /**
       * 방금 배정한 프로젝트 정보를 목록에서 찾아 패널 상태에 즉시 반영합니다.
       * @param project 배정 가능 프로젝트 항목
       * @returns 저장한 프로젝트 식별자와 일치하는지 여부
       */
      function findSavedProject(project: AssignableProjectItem): boolean {
        return project.projectId === projectId;
      }

      const savedProject = assignableProjects.find(findSavedProject) ?? {
        projectId,
        teamNumber: '',
        teamName: assignedTeamLabel,
        projectName: '',
      };
      setAssignedProject(savedProject);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booths'] }),
        queryClient.invalidateQueries({ queryKey: ['booth-assignable-projects', booth.boothId] }),
      ]);
      router.refresh();
    } catch {
      setSaveErrorMessage('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  }

  /**
   * 배정 가능한 팀 드롭다운 항목을 렌더링합니다.
   * @param project 배정 가능 프로젝트 항목
   * @returns SelectItem 엘리먼트
   */
  function renderAssignableProjectItem(project: AssignableProjectItem) {
    const value = String(project.projectId);
    return (
      <SelectItem
        key={value}
        value={value}
        className="h-11 shrink-0 rounded-[4px] px-4 text-body-r-14 text-gray-50 focus:bg-gray-800 focus:text-gray-50"
      >
        {formatPanelTeamLabel(project)}
      </SelectItem>
    );
  }

  const isSelectDisabled =
    isAssigned || isSaving || isLoadingProjects || Boolean(projectsErrorMessage);
  const canSubmit =
    !isAssigned &&
    !isSaving &&
    !isLoadingProjects &&
    !projectsErrorMessage &&
    selectedProjectId.length > 0;

  return (
    <aside
      aria-label="부스 상세 및 팀 배정"
      className="flex h-[500px] w-full flex-col rounded-xl bg-gray-800 p-8 xl:sticky xl:top-8 xl:w-[444px] xl:shrink-0"
    >
      <div className="flex flex-col items-start">
        <div className="flex w-full items-center justify-between gap-3">
          <Badge
            color={isAssigned ? 'red' : 'none'}
            size="medium"
            className={isAssigned ? undefined : 'text-gray-300'}
          >
            {isAssigned ? '배정 완료' : '미배정'}
          </Badge>
        </div>

        <h2 className="mt-4 text-title-sb-24 text-gray-50">{booth.boothNumber}번 부스</h2>
        <p className="mt-1 text-body-r-14 text-gray-300">{locationText}</p>
      </div>

      <form
        onSubmit={handleAssignSubmit}
        noValidate
        aria-busy={isSaving}
        className="flex flex-1 flex-col"
      >
        <Field className="mt-7 gap-2">
          <FieldLabel
            htmlFor={teamSelectId}
            className="mb-0.5 text-body-sb-14 font-semibold text-gray-200"
          >
            {isAssigned ? '배정된 팀' : '배정할 팀'}
          </FieldLabel>

          <Select<string>
            value={isAssigned ? assignedTeamValue || null : selectedProjectId || null}
            onValueChange={handleProjectSelectChange}
            disabled={isSelectDisabled}
            modal={false}
          >
            <SelectTrigger
              id={teamSelectId}
              className="h-12 w-full cursor-pointer rounded-[4px] bg-gray-900 px-4 text-body-r-14 text-gray-50 data-placeholder:text-gray-400 data-[size=default]:h-12"
            >
              <SelectValue>{renderSelectDisplayValue}</SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className="max-h-60 rounded-[4px] bg-gray-900 p-1 text-gray-50 ring-gray-700"
            >
              {assignableProjects.length > 0 ? (
                assignableProjects.map(renderAssignableProjectItem)
              ) : (
                <div className="px-4 py-3 text-body-r-14 text-gray-400">
                  {isLoadingProjects
                    ? '배정 가능한 팀을 불러오는 중입니다...'
                    : '배정 가능한 팀이 없습니다.'}
                </div>
              )}
            </SelectContent>
          </Select>

          {!isAssigned && isLoadingProjects ? (
            <p role="status" aria-busy="true" className="text-caption-r-12 text-gray-400">
              배정 가능한 팀 목록을 불러오는 중입니다...
            </p>
          ) : !isAssigned && projectsErrorMessage ? (
            <div role="alert" className="flex items-center justify-between gap-2">
              <p className="text-caption-r-12 text-red-400">{projectsErrorMessage}</p>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                disabled={isProjectsFetching || isSaving}
                onClick={handleRetryProjects}
                className="h-7 w-auto shrink-0 rounded-[4px] px-2.5 text-caption-sb-12"
              >
                다시 시도
              </Button>
            </div>
          ) : isAssigned ? (
            <FieldDescription className="text-caption-r-12">
              상세 수정이나 배정 취소는 부스 상세 페이지에서 진행할 수 있습니다.
            </FieldDescription>
          ) : assignableProjects.length === 0 ? (
            <FieldDescription role="status" className="text-caption-r-12">
              현재 배정 가능한 팀이 없습니다.
            </FieldDescription>
          ) : (
            <FieldDescription className="text-caption-r-12">
              이미 배정된 팀은 목록에 표시되지 않습니다.
            </FieldDescription>
          )}
        </Field>

        {saveErrorMessage ? (
          <FieldError className="mt-4 text-caption-r-12 text-red-400">
            {saveErrorMessage}
          </FieldError>
        ) : null}

        <div className="mt-auto flex flex-col items-start pt-8">
          {isAssigned ? (
            <Button
              type="button"
              variant="secondary"
              size="large"
              nativeButton={false}
              render={<Link href={`/booths/${encodeURIComponent(booth.id)}`} />}
              className="h-12 w-auto max-w-none rounded-[4px] px-6 text-body-sb-16"
            >
              부스 상세 보기
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={!canSubmit}
                className="h-12 w-auto max-w-none rounded-[4px] px-6 text-body-sb-16"
              >
                {isSaving ? '저장 중...' : '팀 배정 저장'}
              </Button>
              <p className="mt-2.5 text-caption-r-12 text-gray-400">
                저장 즉시 참가자 부스 화면에 반영됩니다.
              </p>
            </>
          )}
        </div>
      </form>
    </aside>
  );
}
