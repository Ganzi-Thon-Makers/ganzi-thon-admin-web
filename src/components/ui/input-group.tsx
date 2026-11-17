'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface InputGroupProps extends React.ComponentProps<'div'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 인풋과 접두/접미 애드온(아이콘, 텍스트)을 그룹화하는 공용 InputGroup 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon align="inline-start">@</InputGroupAddon>
 *   <InputGroupInput placeholder="아이디" />
 * </InputGroup>
 * ```
 */
export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group relative flex h-12 w-full min-w-0 items-center gap-2 rounded-[4px] px-4 py-3 transition-colors outline-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  'flex h-auto shrink-0 select-none items-center justify-center text-gray-500 group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*="size-"])]:size-6',
  {
    variants: {
      align: {
        'inline-start': 'order-first',
        'inline-end': 'order-last',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

export interface InputGroupAddonProps
  extends React.ComponentProps<'div'>, VariantProps<typeof inputGroupAddonVariants> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * InputGroup 내부에서 아이콘 또는 텍스트 애드온을 배치하는 공용 InputGroupAddon 컴포넌트입니다.
 *
 * 버튼을 제외한 영역 클릭 시 인접한 input으로 포커스를 자동 이동합니다.
 */
export function InputGroupAddon({
  className,
  align = 'inline-start',
  onClick,
  ...props
}: InputGroupAddonProps) {
  /**
   * 애드온 영역 클릭 시 버튼이 아니면 인접 인풋 요소로 포커스를 이동하고 외부 onClick을 실행한다.
   * @param event 마우스 클릭 이벤트 객체
   */
  const handleAddonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    event.currentTarget.parentElement?.querySelector('input')?.focus();
  };

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={handleAddonClick}
      {...props}
    />
  );
}

export interface InputGroupTextProps extends React.ComponentProps<'span'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 애드온 내부에 보조 텍스트 또는 기호를 표시하는 공용 InputGroupText 컴포넌트입니다.
 */
export function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 text-sm text-gray-500 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

export interface InputGroupInputProps extends React.ComponentProps<'input'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * InputGroup 내부에서 테두리와 배경을 제거하고 부모 그룹과 조화를 이루도록 구성된 공용 InputGroupInput 컴포넌트입니다.
 */
export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'h-6 flex-1 rounded-none border-0 bg-transparent p-0 shadow-none ring-0 outline-none focus-visible:bg-transparent focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100 aria-invalid:border-0 dark:bg-transparent dark:disabled:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}
