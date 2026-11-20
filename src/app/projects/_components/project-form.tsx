'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionListItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { ImageThumbnail } from '@/components/ui/image-thumbnail';
import { TextField } from '@/components/ui/text-field';

import type { ProjectSaveResult } from '../_actions/save-project';
import type { ProjectMember } from '../_data/project-api';
import {
  getProjectFormSchema,
  type ProjectFormValues,
  type ProjectMemberOption,
  type ProjectTeamOption,
} from '../_data/project-form';
import { getMemberSelectionIssue } from '../_data/project-member-selection';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<ProjectFormValues>;
  initialThumbnailUrl?: string;
  projectId?: number;
  teams?: ProjectTeamOption[];
  teamError?: string;
  initialMembers?: ProjectMember[];
  onSave?: (values: ProjectFormValues) => Promise<ProjectSaveResult>;
}

const initialFormValues: ProjectFormValues = {
  title: '',
  platform: null,
  serviceUrl: '',
  teamNumber: null,
  teamName: '',
  memberIds: [],
  techStack: '',
  summary: '',
  description: '',
  thumbnail: null,
};

/** 선택 가능한 팀번호 범위 1~30을 만듭니다.
 * @param _value 사용하지 않는 배열 항목
 * @param index 배열 위치
 * @returns 팀번호
 */
function createTeamNumber(_value: unknown, index: number): number {
  return index + 1;
}

const TEAM_NUMBERS = Array.from({ length: 30 }, createTeamNumber);
const fullWidthField =
  'w-full max-w-none self-stretch gap-[10px] [&_[data-slot=field-label]]:text-body-sb-16';
const fieldLabel = 'text-body-sb-16 text-gray-200';

/** 로그인 쿠키를 사용하는 내부 GET 경로에서 팀원 후보를 가져옵니다.
 * @param keyword 이름 검색어
 * @returns 검증된 후보 목록
 */
async function fetchMemberCandidates(keyword: string): Promise<ProjectMemberOption[]> {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  const response = await fetch(`/api/projects/member-candidates?${params.toString()}`);
  if (!response.ok) throw new Error('팀원 후보를 불러오지 못했습니다. 다시 시도해 주세요.');
  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('data' in payload) ||
    !Array.isArray(payload.data)
  )
    throw new Error('팀원 후보 응답을 확인할 수 없습니다.');
  return payload.data as ProjectMemberOption[];
}

export function ProjectForm({
  mode,
  initialValues,
  initialThumbnailUrl,
  projectId,
  teams = [],
  teamError,
  initialMembers = [],
  onSave,
}: ProjectFormProps) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const platformTriggerRef = useRef<HTMLButtonElement>(null);
  const teamTriggerRef = useRef<HTMLButtonElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [imageRevision, setImageRevision] = useState(0);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberKeyword, setMemberKeyword] = useState('');
  const originalRolesResolvedRef = useRef(false);
  const queryClient = useQueryClient();
  const { register, control, setValue, formState, handleSubmit } = useForm<ProjectFormValues>({
    resolver: zodResolver(getProjectFormSchema(mode, Boolean(initialThumbnailUrl))),
    mode: 'onChange',
    defaultValues: { ...initialFormValues, ...initialValues },
  });
  const values = useWatch({ control });
  const thumbnail = values.thumbnail ?? null;
  const selectedTeamNumber = values.teamNumber ?? null;
  const selectedMemberIds: number[] = useMemo(
    /** 선택된 ID 배열을 폼 값이 바뀔 때만 갱신합니다.
     * @returns 최종 선택 ID 목록
     */
    function getSelectedMemberIds() {
      return values.memberIds ?? [];
    },
    [values.memberIds],
  );
  const originalIds = initialMembers.map(
    /** 상세 조회의 팀원 ID를 가져옵니다.
     * @param member 기존 팀원
     * @returns 회원 ID
     */
    function toOriginalId(member) {
      return member.userId;
    },
  );
  const originalMemberIds = new Set(originalIds);
  const allCandidates = useQuery({
    queryKey: ['project-member-candidates', 'all'],
    /** 검색어 없이 기존 팀원의 역할과 전체 후보를 확인합니다.
     * @returns 전체 후보 목록
     */
    queryFn: function getAllCandidates() {
      return fetchMemberCandidates('');
    },
    enabled: mode === 'edit' || selectedTeamNumber !== null,
  });
  const searchedCandidates = useQuery({
    queryKey: ['project-member-candidates', memberKeyword.trim()],
    /** 이름 검색 결과를 가져옵니다.
     * @returns 검색된 후보 목록
     */
    queryFn: function searchCandidates() {
      return fetchMemberCandidates(memberKeyword.trim());
    },
    enabled: selectedTeamNumber !== null && memberKeyword.trim().length > 0,
  });
  const candidatesById = useMemo(
    /** 후보를 ID로 빠르게 찾을 수 있도록 정리합니다.
     * @returns ID별 후보 목록
     */
    function mapCandidatesById() {
      return new Map(
        allCandidates.data?.map(
          /** 후보를 ID와 함께 보관합니다.
           * @param candidate 조회된 후보
           * @returns 회원 ID와 후보 정보
           */
          function toCandidateEntry(candidate) {
            return [candidate.userId, candidate] as const;
          },
        ),
      );
    },
    [allCandidates.data],
  );
  const unresolvedOriginalIds = initialMembers.filter(
    /** 역할을 아직 확인하지 못한 기존 회원을 찾습니다.
     * @param member 기존 팀원
     * @returns 역할 확인이 필요한지 여부
     */
    function isUnresolvedMember(member) {
      return !candidatesById.has(member.userId);
    },
  );
  const memberIssue = allCandidates.isError
    ? '팀원 후보를 불러오지 못했습니다. 기존 선택은 유지됩니다.'
    : allCandidates.isSuccess
      ? (getMemberSelectionIssue(
          allCandidates.data,
          selectedMemberIds,
          originalIds,
          selectedTeamNumber,
          projectId,
        ) ??
        (searchedCandidates.isError ? '팀원 검색에 실패했습니다. 기존 선택은 유지됩니다.' : ''))
      : '';
  const memberSelectionReady = allCandidates.isSuccess && unresolvedOriginalIds.length === 0;
  const visibleCandidates =
    (memberKeyword.trim() ? searchedCandidates.data : allCandidates.data)?.filter(
      /** 선택 가능한 참가자만 검색 결과에 표시합니다.
       * @param candidate 조회된 후보
       * @returns 추가할 수 있는 참가자인지 여부
       */
      function isSelectableCandidate(candidate) {
        return (
          candidate.role === 'PARTICIPANT' &&
          !selectedMemberIds.includes(candidate.userId) &&
          (originalMemberIds.has(candidate.userId) ||
            (candidate.teamNumber === selectedTeamNumber &&
              (candidate.projectId === null ||
                (projectId !== undefined && candidate.projectId === projectId))))
        );
      },
    ) ?? [];
  const selectedMemberSummary = selectedMemberIds
    .map(
      /** 선택된 참가자의 파트와 이름을 한 줄로 표시합니다.
       * @param id 선택된 회원 ID
       * @returns 파트와 이름
       */
      function toMemberLabel(id) {
        const candidate = candidatesById.get(id);
        const original = initialMembers.find(
          /** 후보 조회 전에도 기존 회원의 이름을 표시합니다.
           * @param member 상세 조회의 회원
           * @returns 같은 회원인지 여부
           */
          function isMatchingMember(member) {
            return member.userId === id;
          },
        );
        return `${candidate?.part ?? original?.part ?? '파트 미확인'} · ${candidate?.name ?? original?.name ?? '확인 필요'}`;
      },
    )
    .join(', ');

  useEffect(
    /** 기존 팀원의 역할이 확인되면 TEAM 계정만 최종 참가자 목록에서 제외합니다. */
    function resolveOriginalMemberRoles() {
      if (
        mode !== 'edit' ||
        !allCandidates.isSuccess ||
        originalRolesResolvedRef.current ||
        unresolvedOriginalIds.length > 0
      )
        return;
      originalRolesResolvedRef.current = true;
      const participantIds = selectedMemberIds.filter(
        /** 기존 목록에서 참가자 계정만 남깁니다.
         * @param id 기존 회원 ID
         * @returns 참가자 여부
         */
        function isParticipant(id) {
          return candidatesById.get(id)?.role === 'PARTICIPANT';
        },
      );
      if (participantIds.length !== selectedMemberIds.length)
        setValue('memberIds', participantIds, { shouldValidate: true });
    },
    [
      allCandidates.isSuccess,
      candidatesById,
      mode,
      selectedMemberIds,
      setValue,
      unresolvedOriginalIds.length,
    ],
  );
  const availableTeamNumbers = TEAM_NUMBERS.filter(
    /** 다른 프로젝트가 사용하지 않는 번호만 남깁니다.
     * @param teamNumber 검사할 팀번호
     * @returns 선택 가능 여부
     */
    function isAvailableTeamNumber(teamNumber) {
      return !teams.some(
        /** 팀번호가 다른 프로젝트에서 사용 중인지 확인합니다.
         * @param team 조회한 팀
         * @returns 다른 프로젝트의 점유 여부
         */
        function isOccupied(team) {
          return team.teamNumber === teamNumber && team.projectId !== projectId;
        },
      );
    },
  );

  /** 고른 파일을 폼 상태에 반영합니다.
   * @param file 선택한 이미지 파일
   */
  function handleImageChange(file: File) {
    setValue('thumbnail', file, { shouldDirty: true, shouldValidate: true });
  }

  /** 새로 고른 이미지 파일을 취소하고 기존 미리보기를 복원합니다. */
  function handleImageClear() {
    setValue('thumbnail', null, { shouldDirty: true, shouldValidate: true });
    setImageRevision((revision) => revision + 1);
  }

  /** 서비스 유형을 폼 상태에 반영합니다.
   * @param platform 선택한 서비스 유형
   */
  function handlePlatformChange(platform: string | null) {
    setValue('platform', platform as ProjectFormValues['platform'], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  /** 서비스 유형 목록의 열림 상태를 갱신합니다.
   * @param value 열린 아코디언 항목
   */
  function handlePlatformAccordionChange(value: string[]) {
    setPlatformOpen(value.includes('platform'));
  }

  /** 팀번호 목록의 열림 상태를 갱신합니다.
   * @param value 열린 아코디언 항목
   */
  function handleTeamAccordionChange(value: string[]) {
    setTeamOpen(value.includes('team'));
  }

  /** 선택한 서비스 유형을 폼에 반영하고 목록을 닫습니다.
   * @param event 서비스 유형 선택 이벤트
   */
  function handlePlatformOptionChange(event: ChangeEvent<HTMLInputElement>) {
    const platform = event.target.value;
    if (platform !== 'WEB' && platform !== 'APP') return;
    handlePlatformChange(platform);
    platformTriggerRef.current?.focus();
    setPlatformOpen(false);
  }

  /** 선택한 팀번호를 폼에 반영하고 목록을 닫습니다.
   * @param event 팀번호 선택 이벤트
   */
  function handleTeamOptionChange(event: ChangeEvent<HTMLInputElement>) {
    handleTeamChange(event.target.value);
    teamTriggerRef.current?.focus();
    setTeamOpen(false);
  }

  /** 팀번호 변경 시 수정 폼의 기존 회원 ID를 유지하고 등록 폼의 선택값만 지웁니다.
   * @param teamNumber 선택한 팀번호
   */
  function handleTeamChange(teamNumber: string | null) {
    const selected = Number(teamNumber);
    const nextTeamNumber = availableTeamNumbers.includes(selected) ? selected : null;
    if (nextTeamNumber === selectedTeamNumber) return;
    setValue('teamNumber', nextTeamNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  /** 팀원 목록의 열림 상태를 갱신합니다.
   * @param value 열린 아코디언 항목
   */
  function handleMembersAccordionChange(value: string[]) {
    setMembersOpen(value.includes('members'));
  }

  /** 후보 이름 검색어를 갱신합니다.
   * @param event 검색 입력 이벤트
   */
  function handleMemberKeywordChange(event: ChangeEvent<HTMLInputElement>) {
    setMemberKeyword(event.target.value);
  }

  /** 현재 조회된 후보 한 명을 최종 선택 목록에 추가합니다.
   * @param event 후보 선택 이벤트
   */
  function handleMemberAdd(event: ChangeEvent<HTMLInputElement>) {
    const id = Number(event.target.value);
    const candidate = candidatesById.get(id);
    if (
      !memberSelectionReady ||
      !candidate ||
      selectedTeamNumber === null ||
      selectedMemberIds.includes(id) ||
      candidate.role !== 'PARTICIPANT' ||
      (!originalMemberIds.has(id) &&
        (candidate.teamNumber !== selectedTeamNumber ||
          (candidate.projectId !== null &&
            (projectId === undefined || candidate.projectId !== projectId))))
    )
      return;
    setValue('memberIds', [...selectedMemberIds, id], { shouldDirty: true, shouldValidate: true });
    setMemberKeyword('');
  }

  /** 선택된 참가자 한 명을 최종 목록에서 제거합니다.
   * @param event 제거 버튼 이벤트
   */
  function handleMemberRemove(event: MouseEvent<HTMLButtonElement>) {
    const id = Number(event.currentTarget.value);
    setValue(
      'memberIds',
      selectedMemberIds.filter(
        /** 제거할 ID를 최종 목록에서 제외합니다.
         * @param memberId 현재 선택된 회원 ID
         * @returns 목록에 유지할지 여부
         */
        function keepOtherMember(memberId) {
          return memberId !== id;
        },
      ),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  /** 검증된 폼 값을 저장하고 성공하면 갱신된 화면으로 이동합니다.
   * @param input 검증된 폼 값
   */
  async function handleSave(input: ProjectFormValues) {
    if (!onSave || submittingRef.current) return;
    submittingRef.current = true;
    setIsSaving(true);
    setSaveError('');
    try {
      const result = await onSave(input);
      if (result.ok) {
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        router.replace(mode === 'edit' && projectId ? `/projects/${projectId}` : '/projects');
        router.refresh();
      } else {
        setSaveError(result.message);
      }
    } catch {
      setSaveError('저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  }

  /** 제출 이벤트를 React Hook Form의 검증과 저장 처리에 전달합니다.
   * @param event 폼 제출 이벤트
   */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (!onSave) {
      event.preventDefault();
      return;
    }
    void handleSubmit(handleSave)(event);
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      aria-busy={isSaving}
      className="w-full max-w-[1536px]"
    >
      <div className="rounded-xl bg-gray-800 px-6 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,419px)_minmax(0,1fr)] xl:gap-[50px]">
          <div>
            <ImageThumbnail
              key={imageRevision}
              state={thumbnail || initialThumbnailUrl ? 'Editing' : 'Empty'}
              src={initialThumbnailUrl}
              alt="프로젝트 대표 이미지 미리보기"
              onImageChange={handleImageChange}
              displayLabel={mode === 'create' ? '대표 이미지 등록' : '대표 이미지 수정'}
              accept="image/jpeg,image/png,image/webp"
              className="h-[188px] w-full max-w-[419px]"
            />
            {thumbnail ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleImageClear}
                className="mt-2"
              >
                선택 취소
              </Button>
            ) : null}
            <FieldError>{formState.errors.thumbnail?.message}</FieldError>
          </div>
          <div className="grid content-start gap-6">
            <TextField
              label="프로젝트명 *"
              placeholder="프로젝트명을 입력하세요"
              errorMessage={formState.errors.title?.message}
              className="font-normal"
              containerClassName={fullWidthField}
              inputWrapperClassName="h-12 bg-gray-900"
              {...register('title')}
            />
            <Field className="gap-[10px]">
              <FieldLabel htmlFor="project-platform" className={fieldLabel}>
                서비스 유형 *
              </FieldLabel>
              <Accordion
                value={platformOpen ? ['platform'] : []}
                onValueChange={handlePlatformAccordionChange}
                className="w-full max-w-none overflow-visible"
              >
                <AccordionItem value="platform" className="border-0 bg-transparent">
                  <AccordionTrigger
                    ref={platformTriggerRef}
                    id="project-platform"
                    triggerState={values.platform ? 'entered' : 'default'}
                    className={`h-12 w-full cursor-pointer rounded-[4px] bg-gray-900 px-4 py-0 text-body-r-16 ${values.platform ? 'text-gray-500' : ''}`}
                  >
                    {values.platform ?? '서비스 유형 선택'}
                  </AccordionTrigger>
                  <AccordionContent contentClassName="gap-0 rounded-[4px] bg-gray-900 px-4 py-2">
                    <AccordionListItem className="h-12 border-gray-700 text-gray-100">
                      <label className="flex w-full cursor-pointer items-center">
                        <input
                          type="radio"
                          name="project-platform"
                          value="WEB"
                          checked={values.platform === 'WEB'}
                          onChange={handlePlatformOptionChange}
                          className="peer sr-only"
                        />
                        <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                          WEB
                        </span>
                      </label>
                    </AccordionListItem>
                    <AccordionListItem className="h-12 border-gray-700 text-gray-100">
                      <label className="flex w-full cursor-pointer items-center">
                        <input
                          type="radio"
                          name="project-platform"
                          value="APP"
                          checked={values.platform === 'APP'}
                          onChange={handlePlatformOptionChange}
                          className="peer sr-only"
                        />
                        <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                          APP
                        </span>
                      </label>
                    </AccordionListItem>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <FieldError>{formState.errors.platform?.message}</FieldError>
            </Field>
          </div>
        </div>

        <div className="mt-[18px] grid gap-6 xl:grid-cols-[minmax(0,720fr)_minmax(0,728fr)]">
          <TextField
            label="프로젝트 URL *"
            placeholder="https://"
            errorMessage={formState.errors.serviceUrl?.message}
            className="font-normal"
            containerClassName={fullWidthField}
            inputWrapperClassName="h-12 bg-gray-900"
            {...register('serviceUrl')}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Field className="gap-[10px]">
              <FieldLabel htmlFor="project-team" className={fieldLabel}>
                팀번호 *
              </FieldLabel>
              <Accordion
                value={teamOpen ? ['team'] : []}
                onValueChange={handleTeamAccordionChange}
                className="w-full max-w-none overflow-visible"
              >
                <AccordionItem value="team" className="border-0 bg-transparent">
                  <AccordionTrigger
                    ref={teamTriggerRef}
                    id="project-team"
                    disabled={availableTeamNumbers.length === 0 || Boolean(teamError)}
                    triggerState={selectedTeamNumber ? 'entered' : 'default'}
                    className={`h-12 w-full cursor-pointer rounded-[4px] bg-gray-900 px-4 py-0 text-body-r-16 ${selectedTeamNumber ? 'text-gray-500' : ''}`}
                  >
                    {selectedTeamNumber
                      ? `${String(selectedTeamNumber).padStart(2, '0')}팀`
                      : '팀번호 선택'}
                  </AccordionTrigger>
                  <AccordionContent
                    className="overflow-hidden"
                    contentClassName="max-h-60 gap-0 overflow-y-auto rounded-[4px] bg-gray-900 px-4 py-2"
                  >
                    {availableTeamNumbers.map(
                      /** 선택 가능한 팀번호를 표시합니다.
                       * @param teamNumber 표시할 팀번호
                       * @returns 선택 항목
                       */
                      function renderTeam(teamNumber) {
                        return (
                          <AccordionListItem
                            key={teamNumber}
                            className="h-12 border-gray-700 text-gray-100"
                          >
                            <label className="flex w-full cursor-pointer items-center">
                              <input
                                type="radio"
                                name="project-team"
                                value={String(teamNumber)}
                                checked={selectedTeamNumber === teamNumber}
                                onChange={handleTeamOptionChange}
                                className="peer sr-only"
                              />
                              <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                                {String(teamNumber).padStart(2, '0')}팀
                              </span>
                            </label>
                          </AccordionListItem>
                        );
                      },
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <FieldError>{formState.errors.teamNumber?.message}</FieldError>
              {teamError ? (
                <p role="alert" className="text-body-r-14 text-red-400">
                  {teamError}
                </p>
              ) : null}
              {!teamError && availableTeamNumbers.length === 0 ? (
                <p role="status" className="text-body-r-14 text-gray-400">
                  선택 가능한 팀이 없습니다.
                </p>
              ) : null}
            </Field>
            <TextField
              label="팀이름"
              placeholder="팀이름"
              errorMessage={formState.errors.teamName?.message}
              className="font-normal"
              containerClassName={fullWidthField}
              inputWrapperClassName="h-12 bg-gray-900"
              value={values.teamName ?? ''}
              {...register('teamName')}
            />
          </div>
        </div>

        <div className="mt-[18px] grid gap-6 xl:grid-cols-[minmax(0,720fr)_minmax(0,728fr)]">
          <Field className="min-w-0 gap-[10px]">
            <FieldLabel htmlFor="project-members" className={fieldLabel}>
              팀원 정보 · 파트 + 이름
            </FieldLabel>
            <Accordion
              value={membersOpen ? ['members'] : []}
              onValueChange={handleMembersAccordionChange}
              className="w-full max-w-none overflow-visible"
            >
              <AccordionItem value="members" className="border-0 bg-transparent">
                <AccordionTrigger
                  id="project-members"
                  disabled={selectedTeamNumber === null || !memberSelectionReady}
                  triggerState={selectedMemberIds.length ? 'entered' : 'default'}
                  className="h-12 w-full cursor-pointer rounded-[4px] bg-gray-900 px-4 py-0 text-body-r-16"
                >
                  {selectedMemberSummary || '팀원 검색 및 선택'}
                </AccordionTrigger>
                <AccordionContent contentClassName="gap-3 rounded-[4px] bg-gray-900 px-4 py-3">
                  <input
                    type="search"
                    aria-label="이름으로 팀원 검색"
                    placeholder="이름으로 팀원 검색"
                    value={memberKeyword}
                    onChange={handleMemberKeywordChange}
                    className="h-12 w-full rounded-[4px] bg-gray-800 px-4 text-body-r-16 text-gray-50 outline-none placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {searchedCandidates.isFetching ? (
                      <p role="status" className="py-2 text-body-r-14 text-gray-400">
                        검색 중...
                      </p>
                    ) : visibleCandidates.length ? (
                      visibleCandidates.map(
                        /** 선택 가능한 참가자를 목록에 표시합니다.
                         * @param candidate 참가자 후보
                         * @returns 후보 선택 항목
                         */
                        function renderCandidate(candidate) {
                          return (
                            <AccordionListItem
                              key={candidate.userId}
                              className="h-12 border-gray-700"
                            >
                              <label className="flex w-full cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  value={candidate.userId}
                                  checked={false}
                                  onChange={handleMemberAdd}
                                  className="peer sr-only"
                                />
                                <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                                  {candidate.part ?? '파트 미확인'} · {candidate.name}
                                </span>
                              </label>
                            </AccordionListItem>
                          );
                        },
                      )
                    ) : (
                      <p role="status" className="py-2 text-body-r-14 text-gray-400">
                        선택 가능한 팀원이 없습니다.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {selectedMemberIds.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="선택된 팀원">
                {selectedMemberIds.map(
                  /** 선택된 팀원을 제거 가능한 항목으로 표시합니다.
                   * @param id 선택된 회원 ID
                   * @returns 선택된 팀원 항목
                   */
                  function renderSelectedMember(id) {
                    const candidate = candidatesById.get(id);
                    const original = initialMembers.find(
                      /** 선택된 ID와 일치하는 기존 회원 정보를 찾습니다.
                       * @param member 상세 조회의 회원
                       * @returns 같은 회원인지 여부
                       */
                      function isMatchingOriginal(member) {
                        return member.userId === id;
                      },
                    );
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-2 rounded-[4px] bg-gray-900 px-3 py-2 text-body-r-14"
                      >
                        <span>
                          {candidate?.part ?? original?.part ?? '파트 미확인'} ·{' '}
                          {candidate?.name ?? original?.name ?? '확인 필요'}
                        </span>
                        <button
                          type="button"
                          value={id}
                          onClick={handleMemberRemove}
                          aria-label={`${candidate?.name ?? original?.name ?? '팀원'} 제거`}
                          className="text-gray-400 hover:text-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                        >
                          ×
                        </button>
                      </li>
                    );
                  },
                )}
              </ul>
            ) : null}
            {allCandidates.isPending && selectedTeamNumber !== null ? (
              <p role="status" className="text-body-r-14 text-gray-400">
                팀원 후보를 불러오는 중입니다.
              </p>
            ) : null}
            {memberIssue ? (
              <p role="alert" className="text-body-r-14 text-red-400">
                {memberIssue}
              </p>
            ) : null}
          </Field>
          <TextField
            label="기술 스택 *"
            placeholder="기술 스택을 입력하세요"
            errorMessage={formState.errors.techStack?.message}
            className="font-normal"
            containerClassName={fullWidthField}
            inputWrapperClassName="h-12 bg-gray-900"
            {...register('techStack')}
          />
        </div>
        <div className="mt-[18px] grid gap-[18px]">
          <TextField
            label="한 줄 소개 *"
            placeholder="프로젝트를 한 줄로 소개해 주세요"
            errorMessage={formState.errors.summary?.message}
            className="font-normal"
            containerClassName={fullWidthField}
            inputWrapperClassName="h-12 bg-gray-900"
            {...register('summary')}
          />
          <Field className="gap-[10px]">
            <FieldLabel htmlFor="project-description" className={fieldLabel}>
              상세 설명 *
            </FieldLabel>
            <textarea
              id="project-description"
              rows={1}
              placeholder="프로젝트를 자세히 설명해 주세요"
              aria-invalid={!!formState.errors.description}
              className="h-12 min-h-12 w-full resize-y rounded-[4px] border-0 bg-gray-900 px-4 py-3 text-body-r-16 text-gray-50 ring-0 outline-none placeholder:text-gray-500 focus:border-0 focus:ring-0 focus:outline-none aria-invalid:border-0 aria-invalid:ring-0"
              {...register('description')}
            />
            <FieldError>{formState.errors.description?.message}</FieldError>
          </Field>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap justify-end gap-4">
        <Button
          nativeButton={false}
          render={
            <Link href={mode === 'edit' && projectId ? `/projects/${projectId}` : '/projects'} />
          }
          variant="secondary"
          size="lg"
          className="w-[162px]"
        >
          취소
        </Button>
        <Button
          type={onSave ? 'submit' : 'button'}
          size="lg"
          className="w-[180px]"
          disabled={
            !onSave ||
            !formState.isValid ||
            !memberSelectionReady ||
            Boolean(memberIssue) ||
            isSaving ||
            (mode === 'edit' && !formState.isDirty)
          }
        >
          {isSaving ? '저장 중...' : mode === 'create' ? '프로젝트 등록' : '변경 사항 저장'}
        </Button>
      </div>
      {!onSave ? (
        <p role="status" className="mt-3 text-right text-body-r-14 text-gray-400">
          프로젝트 저장 기능이 일시 중단되었습니다. 입력 내용은 서버에 저장되지 않습니다.
        </p>
      ) : null}
      {saveError ? (
        <p role="alert" className="mt-3 text-right text-body-r-14 text-red-400">
          {saveError}
        </p>
      ) : null}
    </form>
  );
}
