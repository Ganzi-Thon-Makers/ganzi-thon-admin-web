'use client';

import Link from 'next/link';
import { type ChangeEvent, type FormEvent, useId, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionListItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/ui/sidebar';
import { TextField } from '@/components/ui/text-field';

type RegistrationRole = 'PARTICIPANT' | 'TEAM' | 'ADMIN';
type RegistrationField =
  'name' | 'school' | 'phoneNumber' | 'teamNumber' | 'accountId' | 'password' | 'part';
const requiredFields: Record<RegistrationRole, RegistrationField[]> = {
  PARTICIPANT: ['name', 'school', 'phoneNumber', 'teamNumber', 'accountId', 'password', 'part'],
  ADMIN: ['name', 'school', 'phoneNumber', 'accountId', 'password', 'part'],
  TEAM: ['accountId', 'password', 'teamNumber'],
};
interface DropdownOption {
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
}

const roleOptions = [
  { value: 'PARTICIPANT', label: '참여자' },
  { value: 'TEAM', label: '팀' },
  { value: 'ADMIN', label: '어드민' },
];
/** 목록 데이터에 사용 중인 팀 번호를 드롭다운 항목으로 만듭니다.
 * @param _value Array.from이 전달하는 사용하지 않는 값
 * @param index 0부터 시작하는 팀 순서
 * @returns 팀 번호와 화면에 표시할 이름
 */
function createTeamOption(_value: unknown, index: number): DropdownOption {
  return { value: String(index + 1).padStart(2, '0'), label: `${index + 1}팀` };
}

const teamOptions = Array.from({ length: 8 }, createTeamOption);
const partOptions = [
  { value: '기획', label: '기획' },
  { value: '디자인', label: '디자인' },
];

function FormDropdown({ name, label, placeholder, value, options, onChange }: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const itemId = `${id}-options`;

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
    <div className={`min-w-0 ${open ? 'relative z-30' : 'relative z-10'}`}>
      <span id={`${id}-label`} className="mb-[10px] block text-body-r-14 text-gray-200">
        {label}
      </span>
      <Accordion
        value={open ? [itemId] : []}
        onValueChange={handleOpenChange}
        className="relative w-full max-w-none overflow-visible"
      >
        <AccordionItem value={itemId} className="border-0 bg-transparent">
          <AccordionTrigger
            aria-labelledby={`${id}-label`}
            triggerState="entered"
            className={`h-12 cursor-pointer rounded-[4px] bg-gray-900 px-4 py-0 ${value ? 'text-gray-50' : 'text-gray-500'}`}
          >
            {options.find(isSelectedOption)?.label ?? placeholder}
          </AccordionTrigger>
          <AccordionContent
            className="absolute top-full left-0 z-50 h-auto max-h-60 w-full [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
            contentClassName="gap-0 rounded-md bg-gray-900 px-4 py-2"
          >
            {options.map(renderOption)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const phonePattern = /^01[016789]-?\d{3,4}-?\d{4}$/;

export function UserCreateForm() {
  const [role, setRole] = useState<RegistrationRole | ''>('');
  const [values, setValues] = useState<
    Record<RegistrationField, string> & {
      hasEnteredLuckyDraw: boolean;
      hasCompletedCourse: boolean;
    }
  >({
    name: '',
    school: '',
    phoneNumber: '',
    teamNumber: '',
    accountId: '',
    password: '',
    part: '',
    hasEnteredLuckyDraw: false,
    hasCompletedCourse: false,
  });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const isPhoneValid = phonePattern.test(values.phoneNumber.trim());
  /** 현재 역할의 필수 필드가 채워졌고 형식도 유효한지 확인합니다.
   * @param field 검사할 필드
   * @returns 입력값이 유효하면 true
   */
  function isRequiredFieldValid(field: RegistrationField) {
    return values[field].trim().length > 0 && (field !== 'phoneNumber' || isPhoneValid);
  }

  const isFormValid =
    Boolean(role) && requiredFields[role as RegistrationRole].every(isRequiredFieldValid);

  /** 선택한 계정 역할로 표시할 폼을 전환하고 불필요해진 필드를 지웁니다.
   * @param value 새로 선택한 역할
   */
  function handleRoleChange(value: string) {
    const nextRole = value as RegistrationRole;
    setRole(nextRole);
    /** 새 역할에서 사용하지 않는 입력값을 제거합니다.
     * @param current 변경 전 폼 값
     * @returns 새 역할에 필요한 값만 유지한 폼 값
     */
    function clearHiddenFields(current: typeof values) {
      const next = { ...current };
      for (const field of Object.keys(next) as RegistrationField[]) {
        if (requiredFields.PARTICIPANT.includes(field) && !requiredFields[nextRole].includes(field))
          next[field] = '';
      }
      return next;
    }
    setValues(clearHiddenFields);
  }

  /** 선택한 항목을 폼 상태에 반영합니다.
   * @param field 선택한 항목의 필드 이름
   * @param value 선택한 값
   */
  function handleSelectionChange(field: 'teamNumber' | 'part', value: string) {
    /** 선택값을 기존 폼 값에 합칩니다.
     * @param current 변경 전 폼 값
     * @returns 선택값이 반영된 폼 값
     */
    function updateSelection(current: typeof values) {
      return { ...current, [field]: value };
    }
    setValues(updateSelection);
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

  /** 입력 필드의 값을 갱신합니다.
   * @param event 변경된 입력 필드의 이벤트
   */
  function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as RegistrationField;
    const value = event.target.value;
    /** 변경된 입력값을 기존 폼 값에 합칩니다.
     * @param current 변경 전 폼 값
     * @returns 입력값이 반영된 폼 값
     */
    function updateField(current: typeof values) {
      return { ...current, [field]: value };
    }
    setValues(updateField);
  }

  /** 전화번호 입력을 마치면 형식 오류를 표시합니다. */
  function handlePhoneBlur() {
    setPhoneTouched(true);
  }

  /** API 연동 전에는 폼의 기본 제출 동작을 막습니다.
   * @param event 제출 이벤트
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const fieldClass = 'w-full gap-[10px]';
  const inputClass = 'h-12 rounded-[4px] bg-gray-900 text-gray-50';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <Sidebar
        variant="admin"
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
          <form onSubmit={handleSubmit} noValidate>
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
                      name="name"
                      label="이름"
                      placeholder="이름을 입력하세요"
                      value={values.name}
                      onChange={handleFieldChange}
                      required
                      containerClassName={fieldClass}
                      inputWrapperClassName={inputClass}
                    />
                    <TextField
                      name="school"
                      label="학교"
                      placeholder="학교를 입력하세요"
                      value={values.school}
                      onChange={handleFieldChange}
                      required
                      containerClassName={fieldClass}
                      inputWrapperClassName={inputClass}
                    />
                    <TextField
                      name="phoneNumber"
                      label="전화번호"
                      type="tel"
                      inputMode="tel"
                      placeholder="010-0000-0000"
                      value={values.phoneNumber}
                      onChange={handleFieldChange}
                      onBlur={handlePhoneBlur}
                      errorMessage={
                        phoneTouched && values.phoneNumber && !isPhoneValid
                          ? '전화번호 형식을 확인해 주세요.'
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
                        value={values.teamNumber}
                        options={teamOptions}
                        onChange={handleTeamChange}
                      />
                    )}
                  </>
                )}
                {role !== '' && (
                  <TextField
                    name="accountId"
                    label="아이디"
                    placeholder="아이디를 입력하세요"
                    value={values.accountId}
                    onChange={handleFieldChange}
                    required
                    containerClassName={fieldClass}
                    inputWrapperClassName={inputClass}
                  />
                )}
                {role !== '' && (
                  <TextField
                    name="password"
                    label="비밀번호"
                    type="password"
                    autoComplete="new-password"
                    placeholder="비밀번호를 입력하세요"
                    value={values.password}
                    onChange={handleFieldChange}
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
                    value={values.teamNumber}
                    options={teamOptions}
                    onChange={handleTeamChange}
                  />
                )}
                {role !== '' && role !== 'TEAM' && (
                  <FormDropdown
                    name="part"
                    label="파트"
                    placeholder="파트를 선택하세요"
                    value={values.part}
                    options={partOptions}
                    onChange={handlePartChange}
                  />
                )}
                <FormDropdown
                  name="role"
                  label="역할"
                  placeholder="역할을 선택하세요"
                  value={role}
                  options={roleOptions}
                  onChange={handleRoleChange}
                />
              </div>
            </section>
            <div className="mt-7 flex flex-col items-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="small"
                disabled={!isFormValid}
                className="h-12 w-[140px] max-w-[140px] self-end px-3 text-body-sb-16 disabled:bg-red-300"
              >
                사용자 등록하기
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
