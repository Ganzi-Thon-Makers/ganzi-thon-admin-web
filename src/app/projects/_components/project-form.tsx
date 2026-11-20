'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { ImageThumbnail } from '@/components/ui/image-thumbnail';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';

import type { ProjectSaveResult } from '../_actions/save-project';
import type { ProjectMember } from '../_data/project-api';
import {
  getProjectFormSchema,
  type ProjectFormValues,
  type ProjectMemberOption,
  type ProjectTeamOption,
} from '../_data/project-form';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<ProjectFormValues>;
  initialThumbnailUrl?: string;
  projectId?: number;
  teams?: ProjectTeamOption[];
  teamError?: string;
  initialMembers?: ProjectMember[];
  onSave: (values: ProjectFormValues) => Promise<ProjectSaveResult>;
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
const EMPTY_CANDIDATES: ProjectMemberOption[] = [];

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

/** 후보 계정이 선택 가능한지 확인합니다.
 * @param candidate 검사할 후보
 * @param selectedIds 현재 선택된 회원 ID
 * @param projectId 수정 중인 프로젝트 ID
 * @param candidates 전체 후보
 * @returns 선택 가능 여부
 */
function isAvailableMember(
  candidate: ProjectMemberOption,
  selectedIds: number[],
  projectId: number | undefined,
  candidates: ProjectMemberOption[],
): boolean {
  if (candidate.projectId !== null && candidate.projectId !== projectId) return false;
  if (candidate.role !== 'TEAM') return true;
  return !candidates.some(
    /** 다른 팀 계정이 선택되어 있는지 확인합니다.
     * @param member 검사할 후보
     * @returns 다른 팀 계정의 선택 여부
     */
    function isSelectedTeamAccount(member) {
      return (
        member.role === 'TEAM' &&
        member.userId !== candidate.userId &&
        selectedIds.includes(member.userId)
      );
    },
  );
}

/** 같은 출처의 Route Handler에서 후보를 조회합니다.
 * @param keyword 이름 검색어
 * @param signal 요청 취소 신호
 * @returns 검색된 후보 목록
 */
async function fetchCandidates(
  keyword: string,
  signal: AbortSignal,
): Promise<ProjectMemberOption[]> {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  const response = await fetch(`/api/projects/member-candidates?${params}`, { signal });
  const body = (await response.json()) as { data?: ProjectMemberOption[]; message?: string };
  if (!response.ok) throw new Error(body.message ?? '팀원 후보를 불러오지 못했습니다.');
  if (!Array.isArray(body.data)) throw new Error('팀원 후보 응답 형식이 올바르지 않습니다.');
  return body.data;
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [imageRevision, setImageRevision] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<ProjectMemberOption[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, control, setValue, formState, handleSubmit } = useForm<ProjectFormValues>({
    resolver: zodResolver(getProjectFormSchema(mode, Boolean(initialThumbnailUrl))),
    mode: 'onChange',
    defaultValues: { ...initialFormValues, ...initialValues },
  });
  const values = useWatch({ control });
  const thumbnail = values.thumbnail ?? null;
  const selectedIds = values.memberIds ?? [];
  useEffect(
    /** 검색 입력이 멈추면 후보 조회 검색어를 갱신합니다.
     * @returns 대기 중인 검색 취소 함수
     */
    function scheduleSearch() {
      const timer = window.setTimeout(
        /** 검색어를 적용합니다. */
        function applySearch() {
          setKeyword(searchTerm.trim());
        },
        300,
      );
      return function clearSearch() {
        window.clearTimeout(timer);
      };
    },
    [searchTerm],
  );
  /** 후보 조회 함수에 검색어와 취소 신호를 전달합니다.
   * @param context TanStack Query의 요청 문맥
   * @returns 후보 목록
   */
  function queryCandidates({ signal }: { signal: AbortSignal }) {
    return fetchCandidates(keyword, signal);
  }
  const {
    data: memberCandidates = EMPTY_CANDIDATES,
    isPending: candidatesPending,
    error: candidatesError,
  } = useQuery({
    queryKey: ['project-member-candidates', keyword],
    queryFn: queryCandidates,
    retry: false,
  });
  const allCandidates =
    queryClient.getQueryData<ProjectMemberOption[]>(['project-member-candidates', '']) ??
    EMPTY_CANDIDATES;
  const visibleCandidates = memberCandidates.filter(
    /** 선택한 팀에 속한 후보만 표시합니다.
     * @param candidate 검색된 후보
     * @returns 현재 팀 여부
     */
    function isCurrentTeam(candidate) {
      return candidate.teamNumber === values.teamNumber;
    },
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
  const selectedMemberLabel = selectedIds
    .map(
      /** 선택된 회원의 파트와 이름을 찾습니다.
       * @param userId 선택된 회원 ID
       * @returns 표시할 파트와 이름
       */
      function getMemberLabel(userId: number) {
        const member = [
          ...memberCandidates,
          ...selectedCandidates,
          ...allCandidates,
          ...initialMembers,
        ].find(
          /** 같은 회원 ID를 찾습니다.
           * @param item 검색 후보 또는 기존 회원
           * @returns ID 일치 여부
           */
          function matchesSelectedMember(item) {
            return item.userId === userId;
          },
        );
        return member ? `${member.part ?? 'TEAM'} ${member.name}` : `회원 ${userId}`;
      },
    )
    .join(', ');

  /** 고른 파일을 폼 상태에 반영합니다.
   * @param file 선택한 이미지 파일
   */
  function handleImageChange(file: File) {
    setValue('thumbnail', file, { shouldDirty: true, shouldValidate: true });
  }

  /** 후보 이름 검색 입력을 변경합니다.
   * @param event 검색 입력 이벤트
   */
  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value);
  }

  /** 팀원 선택 목록의 열림 상태를 전환합니다. */
  function handleMembersOpenChange() {
    setMembersOpen((open) => !open);
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

  /** 선택한 팀의 번호와 이름을 함께 갱신합니다.
   * @param teamNumber 선택한 팀번호
   */
  function handleTeamChange(teamNumber: string | null) {
    const selected = Number(teamNumber);
    setValue('teamNumber', availableTeamNumbers.includes(selected) ? selected : null, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  /** 후보 선택을 회원 ID 배열에 반영합니다.
   * @param userId 선택한 회원 ID
   */
  function handleMemberToggle(userId: number) {
    const candidate = memberCandidates.find(
      /** 선택한 후보를 찾습니다.
       * @param member 검색된 후보
       * @returns 회원 ID 일치 여부
       */
      function matchesMember(member) {
        return member.userId === userId;
      },
    );
    if (candidate && !selectedIds.includes(userId))
      setSelectedCandidates([...selectedCandidates, candidate]);
    const nextIds = selectedIds.includes(userId)
      ? selectedIds.filter(
          /** 해제한 회원을 제외합니다.
           * @param id 검사할 회원 ID
           * @returns 유지 여부
           */
          function keepMember(id: number) {
            return id !== userId;
          },
        )
      : [...selectedIds, userId];
    setValue('memberIds', nextIds, { shouldDirty: true, shouldValidate: true });
  }

  /** 검증된 폼 값을 저장하고 성공하면 갱신된 화면으로 이동합니다.
   * @param input 검증된 폼 값
   */
  async function handleSave(input: ProjectFormValues) {
    if (submittingRef.current) return;
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
    void handleSubmit(handleSave)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate aria-busy={isSaving}>
      <div className="rounded-xl bg-gray-800 px-6 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,419px)_minmax(0,1fr)] xl:gap-[50px]">
          <div>
            <ImageThumbnail
              key={imageRevision}
              state={thumbnail || initialThumbnailUrl ? 'Editing' : 'Empty'}
              src={initialThumbnailUrl}
              alt="프로젝트 대표 이미지 미리보기"
              onImageChange={handleImageChange}
              displayLabel={mode === 'create' ? '대표 이미지 등록 *' : '대표 이미지 수정'}
              accept="image/jpeg,image/png,image/webp"
              className="h-[188px] w-full max-w-none"
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
              <Select value={values.platform ?? null} onValueChange={handlePlatformChange}>
                <SelectTrigger
                  id="project-platform"
                  className="h-12 w-full border-0 px-4 text-body-r-16"
                >
                  <SelectValue placeholder="서비스 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB">WEB</SelectItem>
                  <SelectItem value="APP">APP</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>{formState.errors.platform?.message}</FieldError>
            </Field>
          </div>
        </div>

        <div className="mt-[18px] grid gap-6 xl:grid-cols-[minmax(0,720fr)_minmax(0,728fr)]">
          <TextField
            label="프로젝트 URL"
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
              <Select
                value={values.teamNumber?.toString() ?? null}
                onValueChange={handleTeamChange}
                disabled={availableTeamNumbers.length === 0 || Boolean(teamError)}
              >
                <SelectTrigger
                  id="project-team"
                  className="h-12 w-full border-0 px-4 text-body-r-16"
                >
                  <SelectValue placeholder="팀 목록 연결 후 선택 가능" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeamNumbers.map(
                    /** 선택 가능한 팀번호를 표시합니다.
                     * @param teamNumber 표시할 팀번호
                     * @returns 선택 항목
                     */
                    function renderTeam(teamNumber) {
                      return (
                        <SelectItem key={teamNumber} value={String(teamNumber)}>
                          {String(teamNumber).padStart(2, '0')}팀
                        </SelectItem>
                      );
                    },
                  )}
                </SelectContent>
              </Select>
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
              label="팀이름 *"
              placeholder="팀이름을 입력하세요"
              errorMessage={formState.errors.teamName?.message}
              className="font-normal"
              containerClassName={fullWidthField}
              inputWrapperClassName="h-12 bg-gray-900"
              {...register('teamName')}
            />
          </div>
        </div>

        <div className="mt-[18px] grid gap-6 xl:grid-cols-[minmax(0,720fr)_minmax(0,728fr)]">
          <Field className="gap-[10px]">
            <FieldLabel className={fieldLabel}>팀원 정보 · 파트 + 이름</FieldLabel>
            <button
              type="button"
              aria-expanded={membersOpen}
              aria-controls="project-member-options"
              onClick={handleMembersOpenChange}
              className="flex h-12 w-full items-center justify-between rounded-[4px] bg-gray-900 px-4 text-left text-body-r-16 text-gray-50"
            >
              <span className="truncate">{selectedMemberLabel || '팀원 선택'}</span>
              <Icon name="chevron-down" size={24} />
            </button>
            {membersOpen ? (
              <div
                id="project-member-options"
                className="min-h-12 rounded-[4px] bg-gray-900 px-4 py-3 text-body-r-16 text-gray-300"
              >
                <TextField
                  aria-label="팀원 이름 검색"
                  placeholder="이름으로 팀원 검색"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="font-normal"
                  containerClassName={fullWidthField}
                  inputWrapperClassName="h-12 bg-gray-900"
                />
                {initialMembers
                  .filter(
                    /** 검색 결과에 없는 기존 선택 팀원만 표시합니다.
                     * @param member 기존 팀원
                     * @returns 별도 표시 여부
                     */
                    function isMissingFromCandidates(member) {
                      return (
                        selectedIds.includes(member.userId) &&
                        !memberCandidates.some(
                          /** 같은 회원의 검색 결과 여부를 확인합니다.
                           * @param candidate 검색된 후보
                           * @returns 같은 회원 여부
                           */
                          function isSameMember(candidate) {
                            return candidate.userId === member.userId;
                          },
                        )
                      );
                    },
                  )
                  .map(
                    /** 기존 팀원의 파트와 이름을 표시합니다.
                     * @param member 기존 팀원
                     * @returns 선택된 팀원 표시
                     */
                    function renderInitialMember(member) {
                      return (
                        <label key={member.userId} className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked
                            onChange={
                              /** 기존 팀원의 선택을 해제합니다. */
                              function onInitialMemberChange() {
                                handleMemberToggle(member.userId);
                              }
                            }
                          />
                          {member.part} · {member.name}
                        </label>
                      );
                    },
                  )}
                {selectedCandidates
                  .filter(
                    /** 검색 결과 밖의 선택된 후보만 남깁니다.
                     * @param candidate 선택했던 후보
                     * @returns 별도 표시 여부
                     */
                    function isSelectedOutsideSearch(candidate) {
                      return (
                        selectedIds.includes(candidate.userId) &&
                        !initialMembers.some(
                          /** 기존 팀원인지 확인합니다.
                           * @param member 기존 팀원
                           * @returns 같은 회원 여부
                           */
                          function isInitialMember(member) {
                            return member.userId === candidate.userId;
                          },
                        ) &&
                        !memberCandidates.some(
                          /** 검색 결과에 같은 후보가 있는지 확인합니다.
                           * @param result 검색된 후보
                           * @returns 동일 회원 여부
                           */
                          function isSameCandidate(result) {
                            return result.userId === candidate.userId;
                          },
                        )
                      );
                    },
                  )
                  .map(
                    /** 검색 결과 밖의 선택된 팀원을 표시합니다.
                     * @param candidate 선택했던 후보
                     * @returns 선택된 팀원 표시
                     */
                    function renderSelectedCandidate(candidate) {
                      return (
                        <label key={candidate.userId} className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked
                            onChange={
                              /** 검색 결과 밖의 팀원 선택을 해제합니다. */
                              function onSelectedMemberChange() {
                                handleMemberToggle(candidate.userId);
                              }
                            }
                          />
                          {candidate.part ?? candidate.role} · {candidate.name}
                        </label>
                      );
                    },
                  )}
                {candidatesPending ? (
                  <p role="status">팀원 후보를 불러오는 중입니다.</p>
                ) : candidatesError ? (
                  <p role="alert" className="text-red-400">
                    {candidatesError.message}
                  </p>
                ) : visibleCandidates.length === 0 ? (
                  '검색된 팀원이 없습니다.'
                ) : (
                  visibleCandidates.map(
                    /** 후보 선택 항목을 표시합니다.
                     * @param candidate 표시할 후보
                     * @returns 후보 선택 항목
                     */
                    function renderCandidate(candidate) {
                      const available = isAvailableMember(candidate, selectedIds, projectId, [
                        ...memberCandidates,
                        ...selectedCandidates,
                        ...allCandidates,
                      ]);
                      return (
                        <label key={candidate.userId} className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(candidate.userId)}
                            disabled={!available}
                            onChange={
                              /** 후보 선택 상태를 갱신합니다. */
                              function onCandidateChange() {
                                handleMemberToggle(candidate.userId);
                              }
                            }
                          />
                          <span>
                            {candidate.part ?? candidate.role} · {candidate.name}
                          </span>
                        </label>
                      );
                    },
                  )
                )}
              </div>
            ) : null}
            <FieldError>{formState.errors.memberIds?.message}</FieldError>
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
              className="h-12 min-h-12 w-full resize-y rounded-[4px] bg-gray-900 px-4 py-3 text-body-r-16 text-gray-50 outline-none placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-ring"
              {...register('description')}
            />
            <FieldError>{formState.errors.description?.message}</FieldError>
          </Field>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-4">
        <Button
          render={
            <Link href={mode === 'edit' && projectId ? `/projects/${projectId}` : '/projects'} />
          }
          type="button"
          variant="secondary"
          size="lg"
        >
          취소
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={!formState.isValid || isSaving || (mode === 'edit' && !formState.isDirty)}
        >
          {isSaving ? '저장 중...' : mode === 'create' ? '프로젝트 등록' : '변경 사항 저장'}
        </Button>
      </div>
      {saveError ? (
        <p role="alert" className="mt-3 text-right text-body-r-14 text-red-400">
          {saveError}
        </p>
      ) : null}
    </form>
  );
}
