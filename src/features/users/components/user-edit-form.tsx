'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';

import { updateUserAction } from '../actions/update-user';
import type { User } from '../types/user';
import { editSchema, type EditValues } from '../validation/user-edit';
import { type DropdownOption, FormDropdown } from './user-create-form';

/** 번호를 수정 폼의 팀 선택 항목으로 변환합니다.
 * @param _value Array.from이 전달하는 사용하지 않는 값
 * @param index 0부터 시작하는 팀 순서
 * @returns 팀 번호와 화면에 표시할 이름
 */
function createTeamOption(_value: unknown, index: number): DropdownOption {
  const teamNumber = String(index + 1).padStart(2, '0');
  return { value: teamNumber, label: `${teamNumber}팀` };
}

const teamOptions: DropdownOption[] = Array.from({ length: 30 }, createTeamOption);

const partOptions: DropdownOption[] = [
  { value: 'PLAN', label: '기획' },
  { value: 'DESIGN', label: '디자인' },
  { value: 'WEB', label: '웹' },
  { value: 'APP', label: '앱' },
  { value: 'SERVER', label: '서버' },
];

interface UserEditFormProps {
  user: User;
}

/** 기존 상세값을 초기값으로 사용합니다. 비밀번호는 항상 빈 값으로 시작합니다. */
export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const initialValues: EditValues = {
    name: user.name,
    school: user.school,
    phoneNumber: user.phoneNumber,
    teamNumber: user.teamNumber,
    accountId: user.accountId,
    password: '',
    part: user.part,
  };
  const { register, control, setValue, formState, handleSubmit } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    mode: 'onChange',
    defaultValues: initialValues,
  });
  const values = useWatch({ control });

  /** 현재 필드 값이 상세 조회에서 받은 초기값과 다른지 확인합니다.
   * @param key 비교할 입력 필드
   * @returns 입력값이 변경되었으면 true
   */
  function isChangedField(key: keyof EditValues) {
    return values[key] !== initialValues[key];
  }

  /** 선택 항목이 사용자의 기존 팀 번호와 일치하는지 확인합니다.
   * @param option 비교할 팀 선택 항목
   * @returns 기존 팀 번호와 일치하면 true
   */
  function isCurrentTeamOption(option: DropdownOption) {
    return option.value === user.teamNumber;
  }

  /** 선택 항목이 사용자의 기존 파트와 일치하는지 확인합니다.
   * @param option 비교할 파트 선택 항목
   * @returns 기존 파트와 일치하면 true
   */
  function isCurrentPartOption(option: DropdownOption) {
    return option.value === user.part;
  }

  const hasChanged = (Object.keys(initialValues) as (keyof EditValues)[]).some(isChangedField);
  const canSave = hasChanged && formState.isValid && !isSaving;
  const selectedTeam = values.teamNumber ?? '';
  const selectedPart = values.part ?? '';
  const availableTeamOptions = teamOptions.some(isCurrentTeamOption)
    ? teamOptions
    : [{ value: user.teamNumber, label: `${user.teamNumber.padStart(2, '0')}팀` }, ...teamOptions];
  const availablePartOptions = partOptions.some(isCurrentPartOption)
    ? partOptions
    : [{ value: user.part, label: user.part }, ...partOptions];

  /** 선택한 팀 번호를 폼에 반영하고 검증 상태를 갱신합니다.
   * @param value 새로 선택한 팀 번호
   */
  function handleTeamChange(value: string) {
    setValue('teamNumber', value, { shouldValidate: true, shouldDirty: true });
  }

  /** 선택한 파트를 폼에 반영하고 검증 상태를 갱신합니다.
   * @param value 새로 선택한 파트
   */
  function handlePartChange(value: string) {
    setValue('part', value, { shouldValidate: true, shouldDirty: true });
  }

  /** 검증된 변경 사항을 저장하고 결과에 따라 이동하거나 오류를 표시합니다.
   * @param values 제출 시점의 수정 폼 값
   */
  async function handleSave(values: EditValues) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      const result = await updateUserAction(user.id, values);
      if (result.ok) {
        router.replace(`/users/${encodeURIComponent(user.id)}`);
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

  /** 폼 제출 이벤트를 React Hook Form의 검증 및 저장 처리로 전달합니다.
   * @param event 제출 이벤트
   */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(handleSave)(event);
  }

  const fieldClass = 'w-full gap-[10px]';
  const inputClass = 'h-12 rounded-[4px] bg-gray-900 text-gray-50';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant="superadmin"
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
              href={`/users/${encodeURIComponent(user.id)}`}
              aria-label="사용자 상세로 돌아가기"
              className="flex size-12 items-center justify-center rounded-md text-gray-300 hover:bg-gray-800 hover:text-white focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon name="chevron-left" size={40} />
            </Link>
            <h1 className="text-display-sb-32">사용자 정보 수정</h1>
          </div>
          <form onSubmit={handleFormSubmit} noValidate>
            <section
              aria-labelledby="basic-information-heading"
              className="rounded-[12px] bg-gray-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:p-8"
            >
              <h2 id="basic-information-heading" className="mb-6 text-display-sb-28">
                기본 정보
              </h2>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                <TextField
                  {...register('name')}
                  label="이름 *"
                  required
                  containerClassName={fieldClass}
                  inputWrapperClassName={inputClass}
                />
                <TextField
                  {...register('school')}
                  label="학교 *"
                  required
                  containerClassName={fieldClass}
                  inputWrapperClassName={inputClass}
                />
                <TextField
                  {...register('phoneNumber')}
                  label="전화번호 *"
                  type="tel"
                  inputMode="tel"
                  required
                  errorMessage={
                    formState.touchedFields.phoneNumber
                      ? formState.errors.phoneNumber?.message
                      : undefined
                  }
                  containerClassName={fieldClass}
                  inputWrapperClassName={inputClass}
                />
                <FormDropdown
                  name="teamNumber"
                  label="팀번호 *"
                  placeholder="팀을 선택하세요"
                  value={selectedTeam}
                  options={availableTeamOptions}
                  onChange={handleTeamChange}
                  adaptivePosition
                  visibleOptionCount={5}
                />
                <TextField
                  {...register('accountId')}
                  label="아이디 *"
                  required
                  containerClassName={fieldClass}
                  inputWrapperClassName={inputClass}
                />
                <TextField
                  {...register('password')}
                  label="비밀번호"
                  type="password"
                  autoComplete="new-password"
                  placeholder="변경할 경우에만 입력하세요"
                  containerClassName={fieldClass}
                  inputWrapperClassName={inputClass}
                />
                <FormDropdown
                  name="part"
                  label="파트 *"
                  placeholder="파트를 선택하세요"
                  value={selectedPart}
                  options={availablePartOptions}
                  onChange={handlePartChange}
                  adaptivePosition
                  visibleOptionCount={3}
                />
              </div>
            </section>
            <div className="mt-7 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="small"
                disabled={!canSave}
                className="h-12 w-[160px] max-w-[160px] self-end px-3 text-body-sb-16 disabled:bg-red-300"
              >
                저장
              </Button>
            </div>
            {saveError ? (
              <p role="alert" className="mt-3 text-right text-body-r-14 text-red-400">
                {saveError}
              </p>
            ) : null}
          </form>
        </main>
      </div>
    </div>
  );
}
