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

const teamOptions: DropdownOption[] = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label: `${index + 1}팀`,
}));

const partOptions: DropdownOption[] = [
  { value: 'PLAN', label: '기획' },
  { value: 'DESIGN', label: '디자인' },
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
  const hasChanged = (Object.keys(initialValues) as (keyof EditValues)[]).some(
    (key) => values[key] !== initialValues[key],
  );
  const canSave = hasChanged && formState.isValid && !isSaving;
  const selectedTeam = values.teamNumber ?? '';
  const selectedPart = values.part ?? '';
  const availableTeamOptions = teamOptions.some((option) => option.value === user.teamNumber)
    ? teamOptions
    : [{ value: user.teamNumber, label: `${user.teamNumber}팀` }, ...teamOptions];
  const availablePartOptions = partOptions.some((option) => option.value === user.part)
    ? partOptions
    : [{ value: user.part, label: user.part }, ...partOptions];

  function handleTeamChange(value: string) {
    setValue('teamNumber', value, { shouldValidate: true, shouldDirty: true });
  }

  function handlePartChange(value: string) {
    setValue('part', value, { shouldValidate: true, shouldDirty: true });
  }

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
