'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface LabelProps extends React.ComponentProps<'label'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 폼 컨트롤의 텍스트 레이블을 표현하는 공용 Label 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Label htmlFor="username">사용자명</Label>
 * ```
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
