'use client';

import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * Base UI의 InputPrimitive를 기반으로 한 공용 Input 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Input placeholder="내용을 입력하세요" />
 * ```
 */
export function Input({ className, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-[4px] bg-gray-900 px-4 py-3 text-base leading-normal tracking-[-0.16px] text-white transition-colors outline-none placeholder:text-gray-500 focus-visible:bg-gray-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500',
        className,
      )}
      {...props}
    />
  );
}
