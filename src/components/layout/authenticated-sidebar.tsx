'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { SidebarClient, type SidebarVariant } from '@/components/ui/sidebar-client';
import { logoutAction } from '@/lib/auth/actions';

interface AuthenticatedSidebarProps {
  /** 사이드바 역할 변형 */
  variant?: SidebarVariant;
  /** 현재 활성화된 메뉴 ID */
  activeMenuId?: string;
  /** 사이드바 추가 클래스 */
  className?: string;
}

/** 관리자 화면에서 로그아웃 액션을 연결한 Sidebar를 렌더링합니다. */
export function AuthenticatedSidebar({
  variant,
  activeMenuId,
  className,
}: AuthenticatedSidebarProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();

  /**
   * 서버 로그아웃 액션을 실행하고 결과에 따라 로그인 화면으로 이동하거나 오류를 표시합니다.
   * @returns 로그아웃 처리 완료
   */
  const handleLogout = async (): Promise<void> => {
    try {
      const result = await logoutAction();

      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? '로그아웃에 실패했습니다.');
        return;
      }

      router.replace('/');
    } catch {
      setErrorMessage('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <SidebarClient
        activeMenuId={activeMenuId}
        className={className}
        onLogout={handleLogout}
        variant={variant}
      />
      {errorMessage ? (
        <p
          role="alert"
          className="fixed right-4 bottom-4 z-50 max-w-sm rounded-md bg-gray-800 px-4 py-3 text-body-r-14 text-red-400 shadow-lg"
        >
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
