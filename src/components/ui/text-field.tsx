'use client';

import * as React from 'react';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export interface TextFieldProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  /** 입력 필드 상단 레이블 */
  label?: string;
  /** 오류 발생 시 표시할 에러 메시지 */
  errorMessage?: string;
  /** 오류 상태 여부 (기본값: `false`, `errorMessage` 제공 시 `true`로 취급) */
  isError?: boolean;
  /** 강제 시각 상태 (`'default'` / `'typed'` / `'focused'` / `'error'` / `'entered'`) */
  visualState?: 'default' | 'typed' | 'focused' | 'error' | 'entered';
  /** 입력 필드 좌측 아이콘 */
  leadingIcon?: React.ReactNode;
  /** 입력 필드 우측 아이콘 */
  trailingIcon?: React.ReactNode;
  /** 전체 컨테이너 요소 클래스명 */
  containerClassName?: string;
  /** 입력창 박스 요소 클래스명 */
  inputWrapperClassName?: string;
}

/**
 * 레이블 및 입력 상태별 피드백 스타일을 지원하는 공용 TextField 컴포넌트입니다.
 *
 * shadcn Field 및 InputGroup 컴포넌트를 조합하여 구성되었습니다.
 *
 * @example
 * ```tsx
 * <TextField
 *   label="이름"
 *   placeholder="이름을 입력하세요"
 *   errorMessage="필수 입력 항목입니다"
 * />
 * ```
 */
export function TextField({
  className,
  containerClassName,
  inputWrapperClassName,
  label,
  errorMessage,
  isError = false,
  visualState,
  leadingIcon,
  trailingIcon,
  id,
  value,
  defaultValue,
  disabled = false,
  onFocus,
  onBlur,
  onChange,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ref,
  ...props
}: TextFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const [isFocused, setIsFocused] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(String(value ?? defaultValue ?? ''));

  const currentValue = value !== undefined ? String(value) : internalValue;
  const hasValue = currentValue.length > 0;

  const hasError =
    isError ||
    Boolean(errorMessage) ||
    visualState === 'error' ||
    ariaInvalid === true ||
    ariaInvalid === 'true';

  /**
   * 입력 필드 포커스 시 포커스 상태를 활성화하고 외부 콜백을 호출한다.
   * @param event 포커스 이벤트 객체
   */
  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  /**
   * 입력 필드 블러 시 포커스 상태를 해제하고 외부 콜백을 호출한다.
   * @param event 포커스 해제 이벤트 객체
   */
  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  /**
   * 입력 필드 내용 변경 시 내부 상태를 동기화하고 외부 onChange를 호출한다.
   * @param event 인풋 변경 이벤트 객체
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  };

  /**
   * 현재 상태(visualState, 포커스, 입력값 여부)에 따른 컨테이너 배경 색상 클래스를 계산한다.
   * @returns Tailwind 배경 색상 클래스명 문자열
   */
  const getContainerBgColor = (): string => {
    if (hasError) return 'bg-gray-900';
    if (visualState) {
      switch (visualState) {
        case 'focused':
          return 'bg-gray-700';
        case 'entered':
          return 'bg-gray-800';
        case 'typed':
        case 'default':
        default:
          return 'bg-gray-900';
      }
    }

    if (isFocused) {
      return 'bg-gray-700';
    }
    if (hasValue) {
      return 'bg-gray-800';
    }
    return 'bg-gray-900';
  };

  /**
   * 현재 상태에 따른 인풋 텍스트의 타이포그래피 및 색상 클래스를 계산한다.
   * @returns Tailwind 타이포그래피 클래스명 문자열
   */
  const getInputTypographyClass = (): string => {
    if (hasError || visualState === 'focused' || visualState === 'typed' || isFocused) {
      return 'font-normal text-white';
    }
    if (visualState === 'entered' || (!isFocused && hasValue)) {
      return 'font-semibold text-gray-50';
    }
    return 'font-normal text-white';
  };

  const mergedAriaDescribedBy =
    [ariaDescribedBy, hasError && errorMessage ? errorId : undefined].filter(Boolean).join(' ') ||
    undefined;

  return (
    <Field
      data-invalid={hasError}
      data-disabled={disabled}
      className={cn(
        'relative flex w-80 max-w-full flex-col items-start gap-1 self-start',
        containerClassName,
      )}
    >
      {label ? (
        <FieldLabel
          htmlFor={inputId}
          className="text-body-r-14 leading-normal font-medium tracking-[-0.14px] text-gray-200"
        >
          {label}
        </FieldLabel>
      ) : null}

      <InputGroup
        className={cn(
          'h-12 w-full px-4 py-3 transition-colors',
          getContainerBgColor(),
          disabled && 'cursor-not-allowed opacity-50',
          inputWrapperClassName,
        )}
      >
        {leadingIcon ? (
          <InputGroupAddon align="inline-start" className="mr-1 size-6 shrink-0 text-gray-500">
            {leadingIcon}
          </InputGroupAddon>
        ) : null}

        <InputGroupInput
          ref={ref}
          id={inputId}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          aria-invalid={hasError}
          aria-describedby={mergedAriaDescribedBy}
          className={cn(
            'h-6 w-full min-w-0 bg-transparent text-base leading-normal tracking-[-0.16px] placeholder:text-gray-500 disabled:cursor-not-allowed',
            getInputTypographyClass(),
            className,
          )}
          {...props}
        />

        {trailingIcon ? (
          <InputGroupAddon align="inline-end" className="size-6 shrink-0 text-gray-500">
            {trailingIcon}
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {hasError && errorMessage ? (
        <FieldError
          id={errorId}
          className="text-body-r-14 leading-normal font-normal tracking-[-0.14px] text-red-500"
        >
          {errorMessage}
        </FieldError>
      ) : null}
    </Field>
  );
}
