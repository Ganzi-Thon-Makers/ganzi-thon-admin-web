'use client';

import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/ui/sidebar';

import { UserListClient } from './_components/user-list-client';
import { mockUsers } from './_data/users';

/** 사용자 상세 보기 선택을 현재 콘솔에서 확인할 수 있도록 기록합니다.
 * @param userId 선택된 사용자의 식별자
 */
function handleViewUserDetails(userId: string) {
  console.log('사용자 상세 보기 선택:', userId);
}

/** ADMIN-02-1 전체 사용자 조회 기본 화면입니다. */
export default function UsersPage() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <Sidebar
        variant="admin"
        activeMenuId="users"
        className="sticky top-0 h-screen min-h-0 self-start"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 border-b border-gray-800 bg-gray-900 px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>

        <main className="flex-1 px-10 py-10 xl:px-16">
          <h1 className="mb-10 text-display-sb-36 text-gray-50">전체 사용자</h1>

          <UserListClient users={mockUsers} onViewDetails={handleViewUserDetails} />
        </main>
      </div>
    </div>
  );
}
