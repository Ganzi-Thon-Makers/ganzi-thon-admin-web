import type { ReactNode } from 'react';

import { AdminHeader } from '@/components/layout/admin-header';
import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import type { SidebarVariant } from '@/components/ui/sidebar-client';

export interface BoothPageShellProps {
  /** 사이드바 역할 변형 */
  sidebarVariant: SidebarVariant;
  /** 메인 영역에 렌더링할 페이지 콘텐츠 */
  children: ReactNode;
}

/** 부스 관리 목록 및 상세 페이지에서 공통으로 사용하는 사이드바 / 헤더 / 메인 레이아웃 셸을 렌더링합니다. */
export function BoothPageShell({ sidebarVariant, children }: BoothPageShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={sidebarVariant}
        activeMenuId="booths"
        className="sticky top-0 h-screen min-h-0 self-start"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 px-10 pt-12 pb-10 xl:px-16">{children}</main>
      </div>
    </div>
  );
}
