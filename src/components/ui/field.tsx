'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const fieldVariants = cva('group/field flex w-full gap-2 data-[invalid=true]:text-red-500', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal: 'flex-row items-center *:data-[slot=field-label]:flex-auto',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export interface FieldProps extends ComponentProps<'div'>, VariantProps<typeof fieldVariants> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 폼 필드 요소를 묶는 공용 Field 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Field orientation="vertical">
 *   <FieldLabel htmlFor="email">이메일</FieldLabel>
 *   <Input id="email" />
 *   <FieldError>필수 입력입니다.</FieldError>
 * </Field>
 * ```
 */
export function Field({ className, orientation = 'vertical', ...props }: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

export interface FieldLabelProps extends ComponentProps<typeof Label> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * Field 내부에서 사용되는 공용 FieldLabel 컴포넌트입니다.
 */
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export interface FieldDescriptionProps extends ComponentProps<'p'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 필드에 대한 부가 설명 텍스트를 표시하는 공용 FieldDescription 컴포넌트입니다.
 */
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-left text-sm leading-normal font-normal text-gray-400 group-has-data-horizontal/field:text-balance',
        className,
      )}
      {...props}
    />
  );
}

export interface FieldErrorItem {
  /** 에러 메시지 문자열 */
  message?: string;
}

export interface FieldErrorProps extends ComponentProps<'div'> {
  /** 에러 메시지 목록 객체 배열 */
  errors?: Array<FieldErrorItem | undefined>;
}

/**
 * 오류 항목의 메시지를 키로 하는 Map 엔트리 튜플을 생성한다.
 * @param error 오류 정보 객체
 * @returns 메시지와 오류 객체로 구성된 튜플
 */
function getErrorEntry(
  error: FieldErrorItem | undefined,
): [string | undefined, FieldErrorItem | undefined] {
  return [error?.message, error];
}

/**
 * 필드의 오류 메시지를 접근성(role="alert")과 함께 표시하는 공용 FieldError 컴포넌트입니다.
 */
export function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
  /**
   * 오류 항목 객체를 리스트 아이템 노드로 변환한다.
   * @param error 오류 정보 객체
   * @param index 오류 항목 인덱스
   * @returns 렌더링된 li 엘리먼트 또는 null
   */
  const renderErrorItem = (error: FieldErrorItem | undefined, index: number): ReactNode => {
    if (!error?.message) {
      return null;
    }
    return <li key={index}>{error.message}</li>;
  };

  /**
   * children 속성 또는 오류 목록을 기반으로 표시할 오류 콘텐츠 노드를 계산한다.
   * @returns 렌더링할 React 노드 또는 null
   */
  const computeErrorContent = (): ReactNode => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [...new Map(errors.map(getErrorEntry)).values()];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">{uniqueErrors.map(renderErrorItem)}</ul>
    );
  };

  const content = computeErrorContent();

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-sm font-normal text-red-500', className)}
      {...props}
    >
      {content}
    </div>
  );
}
