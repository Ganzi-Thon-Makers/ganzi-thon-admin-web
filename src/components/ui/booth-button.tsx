import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/** BoothButton의 시각적 상태를 정의합니다. */
const boothButtonVariants = cva(
  'flex size-[72px] flex-col items-center justify-center rounded-[4px] px-2 py-[13px] text-center font-sans text-caption-sb-12 text-gray-50 transition-colors',
  {
    variants: {
      state: {
        default: 'bg-gray-600',
        pressed: 'bg-red-500',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

export interface BoothButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof boothButtonVariants> {
  /** 버튼에 표시할 서비스 이름 */
  children: React.ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

/** 72px 정사각형 서비스 선택 버튼입니다. */
export function BoothButton({
  className,
  state = 'default',
  type = 'button',
  children,
  ...props
}: BoothButtonProps) {
  return (
    <button
      type={type}
      data-slot="booth-button"
      aria-pressed={state === 'pressed'}
      className={cn(boothButtonVariants({ state, className }))}
      {...props}
    >
      {children}
    </button>
  );
}
