import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * Badge 컴포넌트의 색상 및 크기 변형 정의
 */
const badgeVariants = cva(
  'inline-flex shrink-0 items-center justify-center font-sans whitespace-nowrap not-italic transition-colors select-none',
  {
    variants: {
      color: {
        red: 'bg-red-500 text-white',
        ivory: 'bg-ivory-200 text-static-black',
        none: 'bg-gray-700 text-white',
      },
      size: {
        medium: 'rounded-[4px] px-3 py-1 text-sm font-semibold leading-normal tracking-[-0.14px]',
        small: 'rounded-xs px-2 py-1 text-[10px] font-medium leading-normal tracking-[-0.1px]',
        xsmall: 'rounded-xs px-2 py-0.5 text-[10px] font-medium leading-normal tracking-[-0.1px]',
      },
    },
    defaultVariants: {
      color: 'red',
      size: 'medium',
    },
  },
);

/**
 * 뱃지에 적용 가능한 색상 유니온 타입
 */
export type BadgeColor = 'red' | 'ivory' | 'none';

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof badgeVariants> {
  /** 추가 클래스명 */
  className?: string;
  /** 뱃지 색상 (`'red'` / `'ivory'` / `'none'`) */
  color?: BadgeColor;
  /** 스타일 변형 (color 미지정 시에만 secondary는 none 적용) */
  variant?: 'primary' | 'secondary';
}

/**
 * 서비스 구분 및 상태를 라벨 형태로 표시하는 공용 Badge 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Badge color="red" size="medium">
 *   WEB
 * </Badge>
 * ```
 */
export function Badge({
  className,
  color,
  size = 'medium',
  variant = 'primary',
  children,
  ...props
}: BadgeProps) {
  // variant가 secondary이고 color가 미지정된 경우에만 none(gray-700)으로 설정
  const resolvedColor: BadgeColor = color ?? (variant === 'secondary' ? 'none' : 'red');

  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ color: resolvedColor, size, className }))}
      {...props}
    >
      {children}
    </div>
  );
}

export { badgeVariants };
