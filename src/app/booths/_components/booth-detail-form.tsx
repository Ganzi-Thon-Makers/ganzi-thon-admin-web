'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type FormEvent, useId, useRef, useState } from 'react';
import { Controller, type ControllerRenderProps, useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  type AssignableProjectItem,
  type BoothApiZone,
  fetchAssignableProjects,
  parseBoothApiJsonSafely,
} from '../_data/booths';
import { type BoothDetailFormValues, boothDetailSchema } from '../_validation/booth-detail';

export interface BoothRoomOption {
  /** 서버 호실 번호 원본 값 */
  roomNumber: string | number;
  /** 화면 표시용 호실 이름 */
  name: string;
}

export interface BoothZoneRoomOption {
  /** Swagger API 구역 코드 */
  apiZone: BoothApiZone;
  /** 구역 표시 이름 */
  label: string;
  /** 해당 구역에 속한 호실 선택 목록 */
  rooms: BoothRoomOption[];
}

export interface BoothDetailFormProps {
  /** 수정 대상 부스 식별자 */
  boothId: number;
  /** 구역별 선택 가능한 호실 목록 */
  zoneRoomOptions: BoothZoneRoomOption[];
  /** 서버에서 조회한 초기 배정 가능 팀 목록 (실패 시 undefined) */
  initialAssignableProjects?: AssignableProjectItem[];
  /** 서버에서 배정 가능 팀 목록 조회 실패 시 오류 메시지 */
  initialAssignableProjectsError?: string;
  /** 초기 구역 코드 */
  initialZone: BoothApiZone;
  /** 초기 호실 원본 값 */
  initialRoomNumber: string | number;
  /** 초기 호실 표시 이름 */
  initialRoomName: string;
  /** 초기 부스 번호 문자열 */
  initialBoothNumber: string;
  /** 초기 위치 정보 문자열 */
  initialLocation: string;
  /** 초기 배정된 프로젝트 정보 (미배정 시 null) */
  initialProject: AssignableProjectItem | null;
}

const FIELD_LABEL_CLASS = 'mb-0.5 font-normal text-body-r-14 text-gray-200';
const INPUT_CLASS =
  'h-12 w-full rounded-[4px] border-0 bg-gray-900 px-4 text-body-r-14 text-gray-50 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50';
const SELECT_TRIGGER_CLASS =
  'h-12 w-full cursor-pointer rounded-[4px] border-0 bg-gray-900 px-4 text-body-r-14 text-gray-50 data-placeholder:text-gray-400 data-[size=default]:h-12';
const SELECT_CONTENT_CLASS = 'max-h-60 rounded-[4px] bg-gray-900 p-1 text-gray-50 ring-gray-700';
const SELECT_ITEM_CLASS =
  'h-11 shrink-0 rounded-[4px] px-4 text-body-r-14 text-gray-50 focus:bg-gray-800 focus:text-gray-50';

/**
 * 배정 가능한 팀 선택 항목의 화면 표시 문구를 생성합니다.
 * @param project 배정 가능 프로젝트 정보
 * @returns `01팀 / 팀명` 형식의 표시 문구
 */
function formatTeamOptionLabel(project: AssignableProjectItem): string {
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
 * 입력된 호실 문자열이나 선택값을 API 전송용 roomNumber 타입으로 정규화합니다.
 * @param inputValue 화면의 호수 입력 또는 선택 값
 * @param zoneRooms 현재 선택된 구역의 호실 목록
 * @param savedRoomNumber 서버에서 받은 기준 호실 원본 값
 * @returns API 요청 본문에 전달할 호실 값 또는 미입력 시 null
 */
function resolveSubmitRoomNumber(
  inputValue: string,
  zoneRooms: BoothRoomOption[],
  savedRoomNumber: string | number,
): string | number | null {
  const trimmed = inputValue.trim();
  if (!trimmed) return null;

  /**
   * 구역 내 호실 목록에서 입력값과 일치하는 호실 항목을 찾습니다.
   * @param room 구역 내 호실 항목
   * @returns 입력값 또는 표시 이름과 일치하는지 여부
   */
  function matchesZoneRoom(room: BoothRoomOption): boolean {
    return String(room.roomNumber) === trimmed || room.name === trimmed;
  }

  const matchedRoom = zoneRooms.find(matchesZoneRoom);
  if (matchedRoom) {
    return matchedRoom.roomNumber;
  }

  if (typeof savedRoomNumber === 'number' && /^\d+호?$/.test(trimmed)) {
    return Number(trimmed.replace(/호$/, ''));
  }

  if (
    typeof savedRoomNumber === 'string' &&
    /^\d+$/.test(savedRoomNumber) &&
    /^\d+호$/.test(trimmed)
  ) {
    return trimmed.replace(/호$/, '');
  }

  return trimmed;
}

/**
 * 부스 상세 정보 수정 및 팀 배정 / 배정 취소 폼을 렌더링합니다.
 */
export function BoothDetailForm({
  boothId,
  zoneRoomOptions,
  initialAssignableProjects,
  initialAssignableProjectsError,
  initialZone,
  initialRoomNumber,
  initialRoomName,
  initialBoothNumber,
  initialLocation,
  initialProject,
}: BoothDetailFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const submittingRef = useRef(false);

  const zoneSelectId = useId();
  const roomControlId = useId();
  const boothNumberInputId = useId();
  const locationInputId = useId();
  const teamSelectId = useId();

  /**
   * 초기 구역에 해당하는 구역 / 호실 옵션을 찾아 초기 호수 입력 방식을 결정합니다.
   * @param option 구역 옵션
   * @returns 초기 구역 일치 여부
   */
  function matchesInitialZoneOption(option: BoothZoneRoomOption): boolean {
    return option.apiZone === initialZone;
  }

  const initialZoneRooms = zoneRoomOptions.find(matchesInitialZoneOption)?.rooms ?? [];
  const initialUsesRoomSelect =
    initialZoneRooms.length > 0 && (initialZone !== 'ZONE1' || initialZoneRooms.length > 1);
  const initialDefaultValues: BoothDetailFormValues = {
    zone: initialZone,
    roomValue: initialUsesRoomSelect ? String(initialRoomNumber) : initialRoomName,
    boothNumber: initialBoothNumber,
    location: initialLocation,
    projectId: initialProject ? String(initialProject.projectId) : '',
  };

  const [savedBaseline, setSavedBaseline] = useState<BoothDetailFormValues>(initialDefaultValues);
  const [savedRoomNumber, setSavedRoomNumber] = useState<string | number>(initialRoomNumber);
  const [savedProject, setSavedProject] = useState<AssignableProjectItem | null>(initialProject);
  const [isUnassigning, setIsUnassigning] = useState<boolean>(false);

  const {
    register,
    control,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isSubmitted, dirtyFields },
  } = useForm<BoothDetailFormValues>({
    resolver: zodResolver(boothDetailSchema),
    mode: 'onSubmit',
    defaultValues: initialDefaultValues,
  });

  const watchedZone = useWatch({ control, name: 'zone' });

  /**
   * TanStack Query를 통해 현재 부스에 배정 가능한 프로젝트 목록을 요청합니다.
   * @param context 요청 취소 신호 객체
   * @returns 배정 가능한 프로젝트 목록
   */
  function queryAssignableProjects({ signal }: { signal: AbortSignal }) {
    return fetchAssignableProjects(boothId, signal);
  }

  const {
    data: fetchedProjects,
    error: projectsError,
    isFetching: isFetchingProjects,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['booth-assignable-projects', boothId],
    queryFn: queryAssignableProjects,
    initialData: initialAssignableProjects,
    enabled:
      initialAssignableProjectsError === undefined || initialAssignableProjects !== undefined,
    staleTime: 30_000,
    retry: false,
  });

  const projectsErrorMessage =
    projectsError?.message ??
    (fetchedProjects === undefined ? initialAssignableProjectsError : undefined);

  /**
   * 현재 선택된 구역 코드에 해당하는 구역 / 호실 설정을 찾습니다.
   * @param option 구역 선택 옵션
   * @returns 선택된 구역과 일치하는지 여부
   */
  function isSelectedZoneOption(option: BoothZoneRoomOption): boolean {
    return option.apiZone === watchedZone;
  }

  const selectedZoneOption = zoneRoomOptions.find(isSelectedZoneOption) ?? zoneRoomOptions[0];
  const selectedZoneRooms = selectedZoneOption?.rooms ?? [];
  const shouldShowRoomSelect =
    selectedZoneRooms.length > 0 && (watchedZone !== 'ZONE1' || selectedZoneRooms.length > 1);

  const availableProjects: AssignableProjectItem[] = [...(fetchedProjects ?? [])];

  /**
   * 목록에 현재 저장된 팀이 이미 포함되어 있는지 판별합니다.
   * @param item 배정 가능 프로젝트 항목
   * @returns 저장된 프로젝트 식별자와 일치하는지 여부
   */
  function matchesSavedProject(item: AssignableProjectItem): boolean {
    return savedProject !== null && item.projectId === savedProject.projectId;
  }

  if (savedProject && !availableProjects.some(matchesSavedProject)) {
    availableProjects.unshift(savedProject);
  }

  const isBusy = isSubmitting || isUnassigning;
  const hasAssignedTeamOnServer = savedProject !== null;

  /**
   * 선택된 구역 코드의 화면 표시 이름을 반환합니다.
   * @param value 선택된 구역 코드
   * @returns 구역 표시 이름
   */
  function renderSelectedZoneLabel(value: string | null): string {
    /**
     * 구역 옵션 중 전달된 코드와 일치하는 항목을 찾습니다.
     * @param option 구역 옵션
     * @returns 구역 코드 일치 여부
     */
    function matchesZoneCode(option: BoothZoneRoomOption): boolean {
      return option.apiZone === value;
    }

    return zoneRoomOptions.find(matchesZoneCode)?.label ?? '구역 선택';
  }

  /**
   * 선택된 호실 값에 대응하는 화면 표시 이름을 반환합니다.
   * @param value 선택된 호실 식별 값
   * @returns 호실 표시 이름
   */
  function renderSelectedRoomLabel(value: string | null): string {
    if (!value) return '호수 선택';

    /**
     * 현재 구역의 호실 목록에서 선택값과 일치하는 항목을 찾습니다.
     * @param room 호실 옵션
     * @returns 호실 값 일치 여부
     */
    function matchesRoomValue(room: BoothRoomOption): boolean {
      return String(room.roomNumber) === value;
    }

    return selectedZoneRooms.find(matchesRoomValue)?.name ?? value;
  }

  /**
   * 선택된 프로젝트 식별자에 대응하는 팀 표시 문구를 반환합니다.
   * @param value 선택된 프로젝트 식별자 문자열
   * @returns `01팀 / 팀명` 또는 미배정 안내 문구
   */
  function renderSelectedTeamLabel(value: string | null): string {
    if (!value) return '배정된 팀 없음';

    /**
     * 선택 가능한 팀 목록에서 선택된 프로젝트 식별자와 일치하는 항목을 찾습니다.
     * @param item 배정 가능 프로젝트 항목
     * @returns 프로젝트 식별자 일치 여부
     */
    function matchesSelectedProject(item: AssignableProjectItem): boolean {
      return String(item.projectId) === value;
    }

    const matched = availableProjects.find(matchesSelectedProject);
    if (matched) return formatTeamOptionLabel(matched);
    if (savedProject && String(savedProject.projectId) === value) {
      return formatTeamOptionLabel(savedProject);
    }
    return '배정된 팀 없음';
  }

  /**
   * 구역 변경 시 해당 구역에 맞는 기본 호실로 `roomValue`를 동기화합니다.
   * @param nextZone 새로 선택된 구역 코드
   */
  function syncRoomValueForZone(nextZone: BoothApiZone) {
    /**
     * 변경된 구역 코드에 해당하는 구역 / 호실 옵션을 찾습니다.
     * @param option 구역 옵션
     * @returns 변경된 구역 일치 여부
     */
    function matchesNextZone(option: BoothZoneRoomOption): boolean {
      return option.apiZone === nextZone;
    }

    const nextZoneOption = zoneRoomOptions.find(matchesNextZone);
    const nextRooms = nextZoneOption?.rooms ?? [];
    const currentRoomValue = getValues('roomValue');

    if (nextRooms.length === 0) {
      setValue('roomValue', '', { shouldDirty: true, shouldValidate: isSubmitted });
      return;
    }

    if (nextZone === 'ZONE1' && nextRooms.length === 1) {
      setValue('roomValue', nextRooms[0].name, {
        shouldDirty: true,
        shouldValidate: isSubmitted,
      });
      return;
    }

    /**
     * 기존 호실 값이 이동할 구역의 호실 목록에도 존재하는지 확인합니다.
     * @param room 이동할 구역의 호실 옵션
     * @returns 호실 값 또는 이름 일치 여부
     */
    function hasCurrentRoom(room: BoothRoomOption): boolean {
      return String(room.roomNumber) === currentRoomValue || room.name === currentRoomValue;
    }

    const existingRoom = nextRooms.find(hasCurrentRoom);
    setValue(
      'roomValue',
      existingRoom ? String(existingRoom.roomNumber) : String(nextRooms[0].roomNumber),
      { shouldDirty: true, shouldValidate: isSubmitted },
    );
  }

  /**
   * 배정 가능한 팀 목록 조회 실패 시 재시도를 요청합니다.
   */
  function handleRetryProjects() {
    void refetchProjects();
  }

  /**
   * 수정을 취소하고 부스 관리 목록 페이지로 돌아갑니다.
   */
  function handleCancel() {
    router.push('/booths');
  }

  /**
   * 현재 부스에 배정된 팀을 취소(DELETE)하고 RHF 기준값과 목록 / 상세 데이터를 갱신합니다.
   */
  async function handleUnassignProject() {
    if (submittingRef.current || !hasAssignedTeamOnServer) return;

    submittingRef.current = true;
    setIsUnassigning(true);
    clearErrors('root.server');

    try {
      const response = await fetch(`/api/booths/${encodeURIComponent(String(boothId))}/project`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const payload = await parseBoothApiJsonSafely(response);
        setError('root.server', {
          message: payload?.message || '팀 배정을 취소하지 못했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }

      const nextBaseline: BoothDetailFormValues = {
        ...savedBaseline,
        projectId: '',
      };
      setSavedBaseline(nextBaseline);
      setSavedProject(null);
      setValue('projectId', '', { shouldDirty: false });
      reset(nextBaseline, { keepDirtyValues: true });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booths'] }),
        queryClient.invalidateQueries({ queryKey: ['booth-assignable-projects', boothId] }),
      ]);
      router.refresh();
    } catch {
      setError('root.server', {
        message: '서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      submittingRef.current = false;
      setIsUnassigning(false);
    }
  }

  /**
   * 검증된 폼 값을 바탕으로 변경 범위에 맞춰 팀 배정 PUT 또는 전체 수정 PUT을 호출합니다.
   * @param values Zod 스키마로 검증된 폼 값
   */
  async function handleValidSubmit(values: BoothDetailFormValues) {
    if (submittingRef.current) return;

    /**
     * 제출 시점의 구역에 해당하는 호실 옵션을 찾습니다.
     * @param option 구역 옵션
     * @returns 제출 구역 일치 여부
     */
    function matchesSubmitZone(option: BoothZoneRoomOption): boolean {
      return option.apiZone === values.zone;
    }

    const submitZoneRooms = zoneRoomOptions.find(matchesSubmitZone)?.rooms ?? [];
    const resolvedRoomNumber = resolveSubmitRoomNumber(
      values.roomValue,
      submitZoneRooms,
      savedRoomNumber,
    );
    if (resolvedRoomNumber === null) {
      setError('roomValue', { message: '호수를 입력하거나 선택해주세요.' });
      return;
    }

    submittingRef.current = true;

    try {
      const parsedBoothNumber = Number(values.boothNumber);
      const parsedProjectId = values.projectId ? Number(values.projectId) : null;
      const isBoothFieldChanged = Boolean(
        dirtyFields.zone ||
        dirtyFields.roomValue ||
        dirtyFields.boothNumber ||
        dirtyFields.location,
      );
      const isProjectChanged = Boolean(dirtyFields.projectId);
      const shouldUpdateOnlyProject =
        !isBoothFieldChanged && isProjectChanged && parsedProjectId !== null;

      const endpoint = shouldUpdateOnlyProject
        ? `/api/booths/${encodeURIComponent(String(boothId))}/project`
        : `/api/booths/${encodeURIComponent(String(boothId))}`;

      const requestBody = shouldUpdateOnlyProject
        ? { projectId: parsedProjectId }
        : {
            zone: values.zone,
            roomNumber: resolvedRoomNumber,
            boothNumber: parsedBoothNumber,
            location: values.location.trim() || null,
            projectId: parsedProjectId,
          };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const payload = await parseBoothApiJsonSafely(response);
        setError('root.server', {
          message:
            payload?.message || '부스 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }

      /**
       * 저장된 프로젝트 식별자에 해당하는 팀 정보를 찾습니다.
       * @param item 배정 가능 프로젝트 항목
       * @returns 프로젝트 식별자 일치 여부
       */
      function matchesSubmittedProject(item: AssignableProjectItem): boolean {
        return item.projectId === parsedProjectId;
      }

      const nextBaseline: BoothDetailFormValues = {
        zone: values.zone,
        roomValue: values.roomValue,
        boothNumber: values.boothNumber,
        location: values.location,
        projectId: values.projectId,
      };
      setSavedBaseline(nextBaseline);
      setSavedRoomNumber(resolvedRoomNumber);
      setSavedProject(
        parsedProjectId !== null
          ? (availableProjects.find(matchesSubmittedProject) ?? savedProject)
          : null,
      );
      reset(nextBaseline);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booths'] }),
        queryClient.invalidateQueries({ queryKey: ['booth-assignable-projects', boothId] }),
      ]);
      router.push('/booths');
      router.refresh();
    } catch {
      setError('root.server', {
        message: '서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      submittingRef.current = false;
    }
  }

  /**
   * 폼 제출 시 이전 서버 오류를 초기화하고 React Hook Form 검증 / 저장 처리를 실행합니다.
   * @param event 폼 제출 이벤트
   */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    clearErrors('root.server');
    void handleSubmit(handleValidSubmit)(event);
  }

  /**
   * 구역 선택 드롭다운의 개별 구역 항목을 렌더링합니다.
   * @param option 구역 선택 옵션
   * @returns SelectItem 엘리먼트
   */
  function renderZoneSelectItem(option: BoothZoneRoomOption) {
    return (
      <SelectItem key={option.apiZone} value={option.apiZone} className={SELECT_ITEM_CLASS}>
        {option.label}
      </SelectItem>
    );
  }

  /**
   * 호실 선택 드롭다운의 개별 호실 항목을 렌더링합니다.
   * @param room 호실 선택 옵션
   * @returns SelectItem 엘리먼트
   */
  function renderRoomSelectItem(room: BoothRoomOption) {
    const value = String(room.roomNumber);
    return (
      <SelectItem key={value} value={value} className={SELECT_ITEM_CLASS}>
        {room.name}
      </SelectItem>
    );
  }

  /**
   * 배정 팀 선택 드롭다운의 개별 프로젝트 항목을 렌더링합니다.
   * @param project 배정 가능 프로젝트 항목
   * @returns SelectItem 엘리먼트
   */
  function renderProjectSelectItem(project: AssignableProjectItem) {
    const value = String(project.projectId);
    return (
      <SelectItem key={value} value={value} className={SELECT_ITEM_CLASS}>
        {formatTeamOptionLabel(project)}
      </SelectItem>
    );
  }

  /**
   * 구역 선택 Controller용 Select 컴포넌트를 렌더링합니다.
   * @param controllerProps RHF Controller 필드 속성
   * @returns 제어되는 구역 Select 엘리먼트
   */
  function renderZoneController({
    field,
  }: {
    field: ControllerRenderProps<BoothDetailFormValues, 'zone'>;
  }) {
    /**
     * 구역 선택 변경을 RHF 상태에 반영하고 구역에 맞는 호실 값을 동기화합니다.
     * @param nextValue 새로 선택된 구역 코드
     */
    function handleZoneSelectChange(nextValue: string | null) {
      if (!nextValue) return;
      const nextZone = nextValue as BoothApiZone;
      field.onChange(nextZone);
      clearErrors('root.server');
      syncRoomValueForZone(nextZone);
    }

    return (
      <Select<string>
        name={field.name}
        value={field.value}
        onValueChange={handleZoneSelectChange}
        disabled={isBusy}
        modal={false}
      >
        <SelectTrigger
          id={zoneSelectId}
          ref={field.ref}
          onBlur={field.onBlur}
          aria-invalid={Boolean(errors.zone)}
          className={SELECT_TRIGGER_CLASS}
        >
          <SelectValue>{renderSelectedZoneLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className={SELECT_CONTENT_CLASS}>
          {zoneRoomOptions.map(renderZoneSelectItem)}
        </SelectContent>
      </Select>
    );
  }

  /**
   * 호실 선택 Controller용 Select 컴포넌트를 렌더링합니다.
   * @param controllerProps RHF Controller 필드 속성
   * @returns 제어되는 호실 Select 엘리먼트
   */
  function renderRoomController({
    field,
  }: {
    field: ControllerRenderProps<BoothDetailFormValues, 'roomValue'>;
  }) {
    /**
     * 호실 선택 변경을 RHF 상태에 반영합니다.
     * @param nextValue 선택된 호실 번호 문자열
     */
    function handleRoomSelectChange(nextValue: string | null) {
      if (nextValue === null) return;
      field.onChange(nextValue);
      clearErrors('root.server');
    }

    return (
      <Select<string>
        name={field.name}
        value={field.value || null}
        onValueChange={handleRoomSelectChange}
        disabled={isBusy}
        modal={false}
      >
        <SelectTrigger
          id={roomControlId}
          ref={field.ref}
          onBlur={field.onBlur}
          aria-invalid={Boolean(errors.roomValue)}
          className={SELECT_TRIGGER_CLASS}
        >
          <SelectValue>{renderSelectedRoomLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className={SELECT_CONTENT_CLASS}>
          {selectedZoneRooms.map(renderRoomSelectItem)}
        </SelectContent>
      </Select>
    );
  }

  /**
   * 배정 팀 선택 Controller용 Select 컴포넌트를 렌더링합니다.
   * @param controllerProps RHF Controller 필드 속성
   * @returns 제어되는 배정 팀 Select 엘리먼트
   */
  function renderTeamController({
    field,
  }: {
    field: ControllerRenderProps<BoothDetailFormValues, 'projectId'>;
  }) {
    /**
     * 배정 팀 선택 변경을 RHF 상태에 반영합니다.
     * @param nextValue 선택된 프로젝트 식별자 문자열
     */
    function handleTeamSelectChange(nextValue: string | null) {
      if (nextValue === null) return;
      field.onChange(nextValue);
      clearErrors('root.server');
    }

    return (
      <Select<string>
        name={field.name}
        value={field.value || null}
        onValueChange={handleTeamSelectChange}
        disabled={isBusy}
        modal={false}
      >
        <SelectTrigger
          id={teamSelectId}
          ref={field.ref}
          onBlur={field.onBlur}
          aria-invalid={Boolean(errors.projectId)}
          className={SELECT_TRIGGER_CLASS}
        >
          <SelectValue>{renderSelectedTeamLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className={SELECT_CONTENT_CLASS}>
          {availableProjects.length > 0 ? (
            availableProjects.map(renderProjectSelectItem)
          ) : (
            <div className="px-4 py-3 text-body-r-14 text-gray-400">
              {isFetchingProjects
                ? '배정 가능한 팀을 불러오는 중입니다...'
                : '배정 가능한 팀이 없습니다.'}
            </div>
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate aria-busy={isBusy}>
      <section
        aria-label="부스 상세 정보"
        className="rounded-[12px] bg-gray-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:p-8"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Field className="min-w-0" data-invalid={Boolean(errors.zone) || undefined}>
            <FieldLabel htmlFor={zoneSelectId} className={FIELD_LABEL_CLASS}>
              구역 *
            </FieldLabel>
            <Controller name="zone" control={control} render={renderZoneController} />
            {errors.zone?.message ? (
              <FieldError className="text-caption-r-12 text-red-400">
                {errors.zone.message}
              </FieldError>
            ) : null}
          </Field>

          <Field className="min-w-0" data-invalid={Boolean(errors.roomValue) || undefined}>
            <FieldLabel htmlFor={roomControlId} className={FIELD_LABEL_CLASS}>
              호수 *
            </FieldLabel>
            {shouldShowRoomSelect ? (
              <Controller name="roomValue" control={control} render={renderRoomController} />
            ) : (
              <Input
                {...register('roomValue')}
                id={roomControlId}
                type="text"
                placeholder="예: 101호"
                disabled={isBusy}
                aria-invalid={Boolean(errors.roomValue)}
                className={INPUT_CLASS}
              />
            )}
            {errors.roomValue?.message ? (
              <FieldError className="text-caption-r-12 text-red-400">
                {errors.roomValue.message}
              </FieldError>
            ) : null}
          </Field>

          <Field className="min-w-0" data-invalid={Boolean(errors.boothNumber) || undefined}>
            <FieldLabel htmlFor={boothNumberInputId} className={FIELD_LABEL_CLASS}>
              부스 번호 *
            </FieldLabel>
            <Input
              {...register('boothNumber')}
              id={boothNumberInputId}
              type="text"
              inputMode="numeric"
              placeholder="예: 01"
              disabled={isBusy}
              aria-invalid={Boolean(errors.boothNumber)}
              className={INPUT_CLASS}
            />
            {errors.boothNumber?.message ? (
              <FieldError className="text-caption-r-12 text-red-400">
                {errors.boothNumber.message}
              </FieldError>
            ) : null}
          </Field>
        </div>

        <Field className="mt-6" data-invalid={Boolean(errors.location) || undefined}>
          <FieldLabel htmlFor={locationInputId} className={FIELD_LABEL_CLASS}>
            위치 정보
          </FieldLabel>
          <Input
            {...register('location')}
            id={locationInputId}
            type="text"
            placeholder="위치 정보를 입력하세요"
            disabled={isBusy}
            aria-invalid={Boolean(errors.location)}
            className={INPUT_CLASS}
          />
          {errors.location?.message ? (
            <FieldError className="text-caption-r-12 text-red-400">
              {errors.location.message}
            </FieldError>
          ) : null}
        </Field>

        <Field
          className="mt-6 w-full lg:w-1/2"
          data-invalid={Boolean(errors.projectId) || undefined}
        >
          <FieldLabel htmlFor={teamSelectId} className={FIELD_LABEL_CLASS}>
            배정된 팀
          </FieldLabel>
          <Controller name="projectId" control={control} render={renderTeamController} />
          <FieldDescription className="text-caption-r-12">
            현재 팀과 아직 배정받지 않은 팀만 선택할 수 있습니다.
          </FieldDescription>
          {errors.projectId?.message ? (
            <FieldError className="text-caption-r-12 text-red-400">
              {errors.projectId.message}
            </FieldError>
          ) : null}
          {projectsErrorMessage ? (
            <div role="alert" className="flex items-center gap-3">
              <p className="text-caption-r-12 text-red-400">{projectsErrorMessage}</p>
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={handleRetryProjects}
                disabled={isFetchingProjects || isBusy}
                className="h-auto w-auto max-w-none self-center p-0 text-caption-sb-12 text-gray-200 underline hover:text-white disabled:text-gray-200 disabled:opacity-50"
              >
                다시 불러오기
              </Button>
            </div>
          ) : null}
        </Field>

        <div className="mt-6 flex flex-col items-start">
          <Button
            type="button"
            variant="secondary"
            size="small"
            disabled={!hasAssignedTeamOnServer || isBusy}
            onClick={handleUnassignProject}
            className={cn(
              'h-11 w-auto max-w-none rounded-[4px] px-5 text-body-sb-14',
              'disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-60',
            )}
          >
            {isUnassigning ? '취소 중...' : '팀 배정 취소'}
          </Button>
          <p className="mt-2 text-caption-r-12 text-gray-400">
            팀 배정을 취소하면 빈 부스로 변경됩니다.
          </p>
        </div>
      </section>

      {errors.root?.server?.message ? (
        <FieldError className="mt-4 text-body-r-14 text-red-400">
          {errors.root.server.message}
        </FieldError>
      ) : null}

      <div className="mt-7 flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={isBusy}
          onClick={handleCancel}
          className="h-12 w-34 rounded-[4px] text-body-sb-16 disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-60"
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={!isDirty || isBusy}
          className="h-12 w-auto max-w-none min-w-34 rounded-[4px] px-6 text-body-sb-16"
        >
          {isSubmitting ? '저장 중...' : '변경 사항 저장'}
        </Button>
      </div>
    </form>
  );
}
