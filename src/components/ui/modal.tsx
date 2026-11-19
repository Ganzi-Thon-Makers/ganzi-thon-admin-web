'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ModalProps {
  /** 모달 열림 여부 */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 모달 제목 */
  title: ReactNode;
  /** 제목 아래 설명 문구 */
  description?: ReactNode;
  /** 취소 버튼 문구 (기본값: `취소`) */
  cancelLabel?: ReactNode;
  /** 확인 버튼 문구 */
  confirmLabel: ReactNode;
  /** 확인 버튼 클릭 콜백 */
  onConfirm: () => void;
  /** 취소 버튼 클릭 콜백 */
  onCancel?: () => void;
  /** 확인 버튼 비활성화 여부 */
  confirmDisabled?: boolean;
  /** 취소 버튼 비활성화 여부 */
  cancelDisabled?: boolean;
  /** 바깥 클릭 / Escape 키로 닫히지 않게 할지 여부 */
  disableDismiss?: boolean;
  /** 팝업 추가 클래스 */
  className?: string;
  /** 설명과 액션 사이에 렌더링할 콘텐츠 */
  children?: ReactNode;
}

/**
 * 공용 Modal 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="제목"
 *   confirmLabel="확인"
 *   onConfirm={handleConfirm}
 * />
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel,
  onConfirm,
  onCancel,
  confirmDisabled,
  cancelDisabled,
  disableDismiss = false,
  className,
  children,
}: ModalProps) {
  /**
   * 열림 상태 변경을 전달하되 dismiss 비활성화 시 Escape 키 닫힘을 막는다.
   * @param nextOpen 다음 열림 상태
   * @param eventDetails 상태 변경 이벤트 정보
   */
  function handleOpenChange(
    nextOpen: boolean,
    eventDetails: DialogPrimitive.Root.ChangeEventDetails,
  ) {
    if (disableDismiss && !nextOpen && eventDetails.reason === 'escape-key') {
      eventDetails.cancel();
      return;
    }
    onOpenChange(nextOpen);
  }

  /**
   * 취소 콜백을 호출하고 모달을 닫는다.
   */
  function handleCancelClick() {
    onCancel?.();
    onOpenChange(false);
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={disableDismiss}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/70" />
        <DialogPrimitive.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-[12px] bg-gray-800 p-8 text-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)] outline-none',
            className,
          )}
        >
          <DialogPrimitive.Title className="text-title-sb-24 text-gray-100">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-body-r-16 whitespace-pre-line text-gray-300">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="large"
              className="max-w-none flex-1"
              disabled={cancelDisabled}
              onClick={handleCancelClick}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="large"
              className="max-w-none flex-1"
              disabled={confirmDisabled}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
