'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useId, useLayoutEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionListItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { SidebarVariant } from '@/components/ui/sidebar-client';
import { TextField } from '@/components/ui/text-field';

import { createUserAction } from '../actions/create-user';
import { createSchema, type CreateValues } from '../validation/user-create';

type RegistrationRole = 'PARTICIPANT' | 'TEAM' | 'ADMIN';
export interface DropdownOption {
  value: string;
  label: string;
}
interface FormDropdownProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  adaptivePosition?: boolean;
  visibleOptionCount?: number;
}

const roleOptions = [
  { value: 'PARTICIPANT', label: '사용자' },
  { value: 'ADMIN', label: '어드민' },
  { value: 'TEAM', label: '팀' },
];
/** 목록 데이터에 사용 중인 팀 번호를 드롭다운 항목으로 만듭니다.
 * @param _value Array.from이 전달하는 사용하지 않는 값
 * @param index 0부터 시작하는 팀 순서
 * @returns 팀 번호와 화면에 표시할 이름
 */
function createTeamOption(_value: unknown, index: number): DropdownOption {
  return { value: String(index + 1).padStart(2, '0'), label: `${index + 1}팀` };
}

const teamOptions = Array.from({ length: 30 }, createTeamOption);
const partOptions = [
  { value: 'PLAN', label: '기획' },
  { value: 'DESIGN', label: '디자인' },
  { value: 'WEB', label: '웹' },
  { value: 'APP', label: '앱' },
  { value: 'SERVER', label: '서버' },
];

export function FormDropdown({
  name,
  label,
  placeholder,
  value,
  options,
  onChange,
  adaptivePosition = false,
  visibleOptionCount,
}: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(240);
  const triggerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const itemId = `${id}-options`;

  /** 열린 드롭다운의 높이를 화면 공간에 맞추고 변경을 감시합니다.
   * @returns 이벤트 구독을 해제하는 정리 함수 또는 구독이 없을 때 undefined
   */
  useLayoutEffect(
    function manageMenuHeight() {
      if (!adaptivePosition || !open) return;

      /** 입력칸 아래의 화면 공간과 항목 수에 맞춰 메뉴 높이를 제한합니다. */
      function updateMenuHeight() {
        const bounds = triggerRef.current
          ?.querySelector('[data-slot="accordion-trigger"]')
          ?.getBoundingClientRect();
        if (!bounds) return;

        const spaceBelow = window.innerHeight - bounds.bottom - 8;
        const desiredHeight =
          Math.min(options.length, visibleOptionCount ?? options.length) * 48 + 16;
        setMenuMaxHeight(Math.min(desiredHeight, Math.max(96, spaceBelow)));
      }

      updateMenuHeight();
      window.addEventListener('resize', updateMenuHeight);
      window.addEventListener('scroll', updateMenuHeight, true);
      /** 드롭다운 높이 계산에 사용한 이벤트 구독을 해제합니다. */
      return function cleanupMenuHeightListeners() {
        window.removeEventListener('resize', updateMenuHeight);
        window.removeEventListener('scroll', updateMenuHeight, true);
      };
    },
    [adaptivePosition, open, options.length, visibleOptionCount],
  );

  /** 드롭다운의 펼침 상태를 Accordion 값에 맞춥니다.
   * @param items 현재 펼쳐진 항목 식별자
   */
  function handleOpenChange(items: string[]) {
    setOpen(items.includes(itemId));
  }

  /** 선택한 값을 부모 폼에 전달하고 목록을 닫습니다.
   * @param event 선택한 라디오 입력의 변경 이벤트
   */
  function handleOptionChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
    setOpen(false);
  }

  /** 현재 선택값과 같은 항목을 찾습니다.
   * @param option 검사할 드롭다운 항목
   * @returns 현재 선택한 항목이면 true
   */
  function isSelectedOption(option: DropdownOption) {
    return option.value === value;
  }

  /** 역할 목록에서는 현재 선택한 역할을 숨깁니다.
   * @param option 표시 여부를 검사할 항목
   * @returns 역할 목록에서 선택 가능한 항목이면 true
   */
  function isVisibleOption(option: DropdownOption) {
    return name !== 'role' || option.value !== value;
  }

  /** 선택 항목의 라디오 행을 그립니다.
   * @param option 표시할 드롭다운 항목
   * @returns 키보드로도 선택할 수 있는 라디오 행
   */
  function renderOption(option: DropdownOption) {
    return (
      <AccordionListItem key={option.value} className="h-12 border-gray-700 text-gray-100">
        <label className="flex w-full cursor-pointer items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleOptionChange}
            className="peer sr-only"
          />
          <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
            {option.label}
          </span>
        </label>
      </AccordionListItem>
    );
  }

  return (
    <div ref={triggerRef} className={`min-w-0 ${open ? 'relative z-30' : 'relative z-10'}`}>
      {label && (
        <span id={`${id}-label`} className="mb-[10px] block text-body-r-14 text-gray-200">
          {label}
        </span>
      )}
      <Accordion
        value={open ? [itemId] : []}
        onValueChange={handleOpenChange}
        className="relative w-full max-w-none overflow-visible"
      >
        <AccordionItem value={itemId} className="border-0 bg-transparent">
          <AccordionTrigger
            aria-labelledby={label ? `${id}-label` : undefined}
            aria-label={label ? undefined : placeholder}
            triggerState="entered"
            className={`h-12 cursor-pointer rounded-[4px] px-4 py-0 ${name === 'role' ? `bg-gray-800 ${open ? 'text-gray-500' : 'text-static-white'}` : value ? 'bg-gray-900 text-gray-50' : 'bg-gray-900 text-gray-500'}`}
          >
            {options.find(isSelectedOption)?.label ?? placeholder}
          </AccordionTrigger>
          <AccordionContent
            className={`${adaptivePosition ? 'relative overscroll-contain' : 'absolute top-full left-0 max-h-60'} z-50 h-auto w-full [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden`}
            style={adaptivePosition ? { maxHeight: menuMaxHeight } : undefined}
            contentClassName="gap-0 rounded-md bg-gray-900 px-4 py-2"
          >
            {options.filter(isVisibleOption).map(renderOption)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface UserCreateFormProps {
  /** 인증 세션 역할에 맞춘 사이드바 변형 */
  sidebarVariant?: SidebarVariant;
}

export function UserCreateForm({ sidebarVariant = 'admin' }: UserCreateFormProps) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultError, setResultError] = useState(false);
  const {
    register,
    control,
    setValue,
    formState,
    handleSubmit: handleFormSubmit,
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      role: 'PARTICIPANT',
      name: '',
      school: '',
      phoneNumber: '',
      teamNumber: '',
      accountId: '',
      password: '',
      part: '',
    },
  });
  const values = useWatch({ control });
  const role = values.role ?? '';

  /** 선택한 계정 역할로 표시할 폼을 전환합니다. 숨겨진 필드의 값은 유지합니다.
   * @param value 새로 선택한 역할
   */
  function handleRoleChange(value: string) {
    setValue('role', value as RegistrationRole, { shouldValidate: true, shouldDirty: true });
  }

  /** 선택한 항목을 폼 상태에 반영합니다.
   * @param field 선택한 항목의 필드 이름
   * @param value 선택한 값
   */
  function handleSelectionChange(field: 'teamNumber' | 'part', value: string) {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  }

  /** 팀번호 드롭다운의 선택값을 반영합니다.
   * @param value 선택한 팀 번호
   */
  function handleTeamChange(value: string) {
    handleSelectionChange('teamNumber', value);
  }

  /** 파트 드롭다운의 선택값을 반영합니다.
   * @param value 선택한 파트
   */
  function handlePartChange(value: string) {
    handleSelectionChange('part', value);
  }

  /** 등록 API를 호출하고 역할에 따라 이동하거나 결과를 안내합니다.
   * @param input 검증을 통과한 등록 입력값
   */
  async function handleSubmit(input: CreateValues) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setResultMessage('');
    try {
      const result = await createUserAction(input);
      if (!result.ok) {
        setResultError(true);
        setResultMessage(result.message);
      } else if (input.role === 'PARTICIPANT') {
        router.replace('/users');
      } else {
        setResultError(false);
        setResultMessage(
          `${input.role === 'TEAM' ? '팀' : '어드민'} 계정이 등록되었습니다. 전체 사용자 목록에는 참여자만 표시됩니다.`,
        );
      }
    } catch {
      setResultError(true);
      setResultMessage('등록하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  /** 폼 검증을 통과한 입력값만 등록 요청에 전달합니다.
   * @param event 폼 제출 이벤트
   */
  function handleFormSubmitEvent(event: FormEvent<HTMLFormElement>) {
    void handleFormSubmit(handleSubmit)(event);
  }

  const fieldClass = 'w-full gap-[10px]';
  const inputClass = 'h-12 rounded-[4px] bg-gray-900 text-gray-50';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={sidebarVariant}
        activeMenuId="users"
        className="sticky top-0 h-screen min-h-0 self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 bg-gray-800 px-6 sm:px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>
        <main className="flex-1 px-6 pt-10 pb-10 sm:px-10 xl:px-16 xl:pt-[90px]">
          <div className="mb-7 flex items-center gap-4">
            <Link
              href="/users"
              aria-label="전체 사용자 목록으로 돌아가기"
              className="flex size-12 items-center justify-center rounded-md text-gray-300 hover:bg-gray-800 hover:text-white focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon name="chevron-left" size={40} />
            </Link>
            <h1 className="text-display-sb-32">사용자 등록</h1>
          </div>
          <form onSubmit={handleFormSubmitEvent} noValidate>
            <div className="mb-7 w-80 max-w-full">
              <FormDropdown
                name="role"
                label=""
                placeholder="역할을 선택하세요"
                value={role}
                options={roleOptions}
                onChange={handleRoleChange}
              />
            </div>
            <section
              aria-labelledby="basic-information-heading"
              className="rounded-[12px] bg-gray-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:p-8"
            >
              <h2 id="basic-information-heading" className="mb-6 text-display-sb-28">
                기본 정보
              </h2>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                {role !== '' && role !== 'TEAM' && (
                  <>
                    <TextField
                      {...register('name')}
                      errorMessage={
                        formState.touchedFields.name ? formState.errors.name?.message : undefined
                      }
                      label="이름"
                      placeholder="이름을 입력하세요"
                      required
                      containerClassName={fieldClass}
                      inputWrapperClassName={inputClass}
                    />
                    <TextField
                      {...register('school')}
                      errorMessage={
                        formState.touchedFields.school
                          ? formState.errors.school?.message
                          : undefined
                      }
                      label="학교"
                      placeholder="학교를 입력하세요"
                      required
                      containerClassName={fieldClass}
                      inputWrapperClassName={inputClass}
                    />
                    <TextField
                      {...register('phoneNumber')}
                      label="전화번호"
                      type="tel"
                      inputMode="tel"
                      placeholder="010-0000-0000"
                      errorMessage={
                        formState.touchedFields.phoneNumber
                          ? formState.errors.phoneNumber?.message
                          : undefined
                      }
                      required
                      containerClassName={fieldClass}
                      inputWrapperClassName={inputClass}
                    />
                    {role === 'PARTICIPANT' && (
                      <FormDropdown
                        name="teamNumber"
                        label="팀번호"
                        placeholder="팀을 선택하세요"
                        value={values.teamNumber ?? ''}
                        options={teamOptions}
                        onChange={handleTeamChange}
                      />
                    )}
                  </>
                )}
                {role !== '' && (
                  <TextField
                    {...register('accountId')}
                    errorMessage={
                      formState.touchedFields.accountId
                        ? formState.errors.accountId?.message
                        : undefined
                    }
                    label="아이디"
                    placeholder="아이디를 입력하세요"
                    required
                    containerClassName={fieldClass}
                    inputWrapperClassName={inputClass}
                  />
                )}
                {role !== '' && (
                  <TextField
                    {...register('password')}
                    errorMessage={
                      formState.touchedFields.password
                        ? formState.errors.password?.message
                        : undefined
                    }
                    label="비밀번호"
                    type="password"
                    autoComplete="new-password"
                    placeholder="비밀번호를 입력하세요"
                    required
                    containerClassName={fieldClass}
                    inputWrapperClassName={inputClass}
                  />
                )}
                {role === 'TEAM' && (
                  <FormDropdown
                    name="teamNumber"
                    label="팀번호"
                    placeholder="팀을 선택하세요"
                    value={values.teamNumber ?? ''}
                    options={teamOptions}
                    onChange={handleTeamChange}
                  />
                )}
                {role !== '' && role !== 'TEAM' && (
                  <FormDropdown
                    name="part"
                    label="파트"
                    placeholder="파트를 선택하세요"
                    value={values.part ?? ''}
                    options={partOptions}
                    onChange={handlePartChange}
                    adaptivePosition
                    visibleOptionCount={3}
                  />
                )}
              </div>
            </section>
            <div className="mt-7 flex flex-col items-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="small"
                disabled={!formState.isValid || isSubmitting}
                className="h-12 w-[140px] max-w-[140px] self-end px-3 text-body-sb-16 disabled:bg-red-300"
              >
                {isSubmitting ? '등록 중...' : '사용자 등록하기'}
              </Button>
              {resultMessage && (
                <p
                  role={resultError ? 'alert' : 'status'}
                  className={`text-body-r-14 ${resultError ? 'text-red-400' : 'text-gray-200'}`}
                >
                  {resultMessage}
                </p>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
