'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Accordion 컴포넌트의 너비 변형 정의
 */
const accordionVariants = cva('flex flex-col overflow-hidden rounded-[4px]', {
  variants: {
    size: {
      default: 'w-80 max-w-80',
      list: 'w-[720px] max-w-[720px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface AccordionProps<Value = unknown>
  extends AccordionPrimitive.Root.Props<Value>, VariantProps<typeof accordionVariants> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 확장/축소 가능한 패널 목록을 그룹화하는 공용 Accordion 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Accordion size="default" defaultValue={['item-1']}>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>아코디언 제목</AccordionTrigger>
 *     <AccordionContent>상세 내용</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export function Accordion<Value = unknown>({
  className,
  size = 'default',
  ...props
}: AccordionProps<Value>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(accordionVariants({ size, className }))}
      {...props}
    />
  );
}

export interface AccordionItemProps extends AccordionPrimitive.Item.Props {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 각각의 개별 아코디언 행을 구성하는 AccordionItem 컴포넌트입니다.
 */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'border-b border-gray-600 bg-gray-900 transition-colors last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

/**
 * AccordionTrigger의 상태별 스타일 정의
 */
const accordionTriggerVariants = cva(
  'group/trigger flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-sans text-body-r-16 transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      triggerState: {
        default: 'text-gray-500 data-[panel-open]:text-white data-open:text-white',
        entered: 'text-white',
      },
    },
    defaultVariants: {
      triggerState: 'default',
    },
  },
);

export interface AccordionTriggerProps
  extends AccordionPrimitive.Trigger.Props, VariantProps<typeof accordionTriggerVariants> {
  /** 추가 클래스명 */
  className?: string;
  /** 화살표(Chevron) 아이콘 표시 여부 (기본값: true) */
  showChevron?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

/**
 * 아코디언 아이템의 열림/닫힘을 토글하는 AccordionTrigger 컴포넌트입니다.
 */
export function AccordionTrigger({
  className,
  children,
  showChevron = true,
  triggerState = 'default',
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="m-0 flex p-0">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(accordionTriggerVariants({ triggerState, className }))}
        {...props}
      >
        <span className="flex-1 truncate">{children}</span>
        {showChevron && (
          <span data-slot="accordion-chevron" className="ml-2 flex shrink-0 items-center">
            <span className="flex group-data-[panel-open]/trigger:hidden group-data-open/trigger:hidden">
              <Icon name="chevron-down" size={24} label="열기 토글" />
            </span>
            <span className="hidden group-data-[panel-open]/trigger:flex group-data-open/trigger:flex">
              <Icon name="chevron-up" size={24} label="닫기 토글" />
            </span>
          </span>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export interface AccordionContentProps extends AccordionPrimitive.Panel.Props {
  /** 패널 추가 클래스명 */
  className?: string;
  /** 내부 콘텐츠 래퍼 추가 클래스명 */
  contentClassName?: string;
  /** 자식 요소 */
  children?: ReactNode;
}

/**
 * 아코디언이 열렸을 때 펼쳐지는 콘텐츠 패널인 AccordionContent 컴포넌트입니다.
 */
export function AccordionContent({
  className,
  contentClassName,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className={cn(
        'h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0',
        className,
      )}
      {...props}
    >
      <div
        data-slot="accordion-content"
        className={cn(
          'flex flex-col gap-2 bg-gray-800 px-4 py-3 font-sans text-body-m-16 text-gray-100',
          contentClassName,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export interface AccordionListItemProps extends ComponentProps<'div'> {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 아코디언 콘텐츠 내부에서 목록 형태의 하위 항목을 표시할 때 사용하는 헬퍼 컴포넌트입니다.
 */
export function AccordionListItem({ className, children, ...props }: AccordionListItemProps) {
  return (
    <div
      data-slot="accordion-list-item"
      className={cn(
        'flex h-[33px] items-center justify-between border-b border-gray-600 text-body-m-16 text-gray-100 last:border-b-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
