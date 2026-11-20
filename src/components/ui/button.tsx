import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Button 컴포넌트의 스타일 및 크기 변형 정의
 */
const buttonVariants = cva(
  'inline-flex shrink-0 self-start cursor-pointer items-center justify-center rounded-[4px] font-sans whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-600 disabled:bg-red-300 disabled:text-white',
        secondary:
          'bg-gray-700 text-white hover:bg-gray-800 active:bg-gray-800 disabled:bg-gray-300 disabled:text-white',
        default:
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-600 disabled:bg-red-300 disabled:text-white',
        outline:
          'border border-gray-700 bg-transparent text-white hover:bg-gray-800 active:bg-gray-900 disabled:border-gray-300 disabled:text-gray-300',
        ghost: 'hover:bg-gray-800 active:bg-gray-900 text-white disabled:text-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-700 disabled:bg-red-300',
        link: 'text-red-500 underline-offset-4 hover:underline disabled:text-gray-300',
      },
      size: {
        large: 'h-12 w-80 max-w-80 px-5 py-4 text-body-sb-16',
        medium: 'h-12 w-70 max-w-70 px-5 py-4 text-body-sb-16',
        small: 'h-12 w-34 max-w-34 px-5 py-4 text-body-sb-16',
        xs: 'h-6 w-34 max-w-34 px-5 py-1 text-caption-sb-12',
        default: 'h-12 w-80 max-w-80 px-5 py-4 text-body-sb-16',
        sm: 'h-9 px-4 text-body-sb-14',
        lg: 'h-12 px-6 text-body-sb-16',
        icon: 'size-12 p-0',
        'icon-lg': 'size-12 p-0',
        'icon-sm': 'size-9 p-0',
        'icon-xs': 'size-6 p-0',
      },
      fullWidth: {
        true: 'w-full max-w-full self-stretch',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'large',
      fullWidth: false,
    },
  },
);

export interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 다양한 크기와 스타일 변형을 제공하는 공용 Button 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="large">
 *   확인
 * </Button>
 * ```
 */
export function Button({
  className,
  variant = 'primary',
  size = 'large',
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
