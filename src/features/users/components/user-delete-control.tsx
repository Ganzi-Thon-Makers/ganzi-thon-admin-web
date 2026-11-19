'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';

import { deleteUserAction } from '../actions/delete-user';

interface UserDeleteControlProps {
  userId: string;
  userName: string;
}

/** 삭제 확인을 받은 뒤에만 서버 액션을 호출합니다. */
export function UserDeleteControl({ userId, userName }: UserDeleteControlProps) {
  const router = useRouter();
  const deletingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  /** 삭제 진행 중에는 모달을 유지하고, 열릴 때 이전 오류를 지웁니다.
   * @param nextOpen 변경할 모달 열림 상태
   */
  function handleOpenChange(nextOpen: boolean) {
    if (deletingRef.current) return;
    setOpen(nextOpen);
    if (nextOpen) setError('');
  }

  /** 확인을 받은 뒤 삭제 요청을 한 번 실행하고 결과를 처리합니다. */
  async function handleConfirm() {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setIsDeleting(true);
    setError('');
    let deleted = false;

    try {
      const result = await deleteUserAction(userId);
      if (result.ok) {
        deleted = true;
        router.replace('/users');
      } else {
        setError(result.message);
      }
    } catch {
      setError('삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      if (!deleted) {
        deletingRef.current = false;
        setIsDeleting(false);
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} disablePointerDismissal={isDeleting}>
      <Dialog.Trigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-12 w-full bg-gray-700 px-6 text-body-sb-16 text-gray-50 sm:w-[136px]"
          />
        }
      >
        사용자 삭제
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-48px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] bg-gray-800 p-6 text-gray-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:p-8">
          <Dialog.Title className="text-title-sb-24">사용자를 삭제하시겠습니까?</Dialog.Title>
          <Dialog.Description className="mt-4 text-body-r-16 text-gray-200">
            삭제 대상: {userName}. 계정과 관련 데이터가 영구 삭제되며 되돌릴 수 없습니다.
          </Dialog.Description>
          {error ? (
            <p role="alert" className="mt-4 text-body-r-14 text-red-400">
              {error}
            </p>
          ) : null}
          <div className="mt-7 flex justify-end gap-3">
            <Dialog.Close
              disabled={isDeleting}
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              취소
            </Dialog.Close>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={isDeleting}
              onClick={handleConfirm}
            >
              {isDeleting ? '삭제 중...' : '삭제 확인'}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
