'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/** 선택 상태를 관리하는 Select 루트 컴포넌트 */
const Select = SelectPrimitive.Root;

/** 옵션 묶음 컴포넌트의 Props */
interface SelectGroupProps extends SelectPrimitive.Group.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 옵션을 묶어 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectGroup 요소
 */
function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  );
}

/** 선택값 표시 컴포넌트의 Props */
interface SelectValueProps extends SelectPrimitive.Value.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 현재 선택값을 표시한다.
 * @param props 컴포넌트 Props
 * @returns SelectValue 요소
 */
function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 text-left', className)}
      {...props}
    />
  );
}

/** 목록을 여닫는 트리거 컴포넌트의 Props */
interface SelectTriggerProps extends SelectPrimitive.Trigger.Props {
  /** 트리거 높이 크기 */
  size?: 'sm' | 'default';
}

/**
 * 옵션 목록을 여닫는 트리거를 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectTrigger 요소
 */
function SelectTrigger({ className, size = 'default', children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'flex w-fit items-center justify-between gap-1.5 rounded-[4px] border border-gray-700 bg-gray-900 py-2 pr-2 pl-2.5 text-sm whitespace-nowrap text-gray-50 transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-gray-500 data-[size=default]:h-8 data-[size=sm]:h-7 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<ChevronDownIcon className="pointer-events-none size-4 text-gray-50" />}
      />
    </SelectPrimitive.Trigger>
  );
}

/** Portal로 띄우는 옵션 팝업 컴포넌트의 Props */
interface SelectContentProps
  extends
    SelectPrimitive.Popup.Props,
    Pick<
      SelectPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
    > {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * Portal 위에 옵션 팝업을 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectContent 요소
 */
function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-[4px] bg-gray-900 text-gray-50 shadow-md ring-1 ring-gray-700 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

/** 옵션 묶음 라벨 컴포넌트의 Props */
interface SelectLabelProps extends SelectPrimitive.GroupLabel.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 옵션 묶음 라벨을 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectLabel 요소
 */
function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-1.5 py-1 text-xs text-gray-500', className)}
      {...props}
    />
  );
}

/** 선택 옵션 컴포넌트의 Props */
interface SelectItemProps extends SelectPrimitive.Item.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 선택 가능한 옵션과 선택 표시를 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectItem 요소
 */
function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-default items-center gap-1.5 rounded-[4px] py-1 pr-8 pl-1.5 text-sm text-gray-50 outline-hidden select-none focus:bg-gray-700 focus:text-gray-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

/** 옵션 구분선 컴포넌트의 Props */
interface SelectSeparatorProps extends SelectPrimitive.Separator.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 옵션 사이 구분선을 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectSeparator 요소
 */
function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-gray-700', className)}
      {...props}
    />
  );
}

/** 위로 스크롤 버튼 컴포넌트의 Props */
interface SelectScrollUpButtonProps extends SelectPrimitive.ScrollUpArrow.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 목록 위쪽 스크롤 버튼을 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectScrollUpButton 요소
 */
function SelectScrollUpButton({ className, ...props }: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        'top-0 z-10 flex w-full cursor-default items-center justify-center bg-gray-900 py-1 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

/** 아래로 스크롤 버튼 컴포넌트의 Props */
interface SelectScrollDownButtonProps extends SelectPrimitive.ScrollDownArrow.Props {
  /** 추가 Tailwind 클래스 */
  className?: string;
}

/**
 * 목록 아래쪽 스크롤 버튼을 렌더링한다.
 * @param props 컴포넌트 Props
 * @returns SelectScrollDownButton 요소
 */
function SelectScrollDownButton({ className, ...props }: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        'bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-gray-900 py-1 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
