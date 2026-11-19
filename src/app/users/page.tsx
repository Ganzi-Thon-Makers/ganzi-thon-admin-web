import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Icon } from '@/components/ui/icon';
import { getServerAuthSession } from '@/lib/auth/cookies';

import { UserListSection } from './_components/user-list-section';

export const instant = false;

/** ADMIN-02-1 전체 사용자 조회 기본 화면입니다. */
export default async function UsersPage() {
  const { role } = await getServerAuthSession();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={sidebarVariant}
        activeMenuId="users"
        className="sticky top-0 h-screen min-h-0 self-start"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 border-b border-gray-800 bg-gray-800 px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>

        <main className="flex-1 px-10 pt-12 pb-10 xl:px-16">
          <h1 className="mb-6 text-display-sb-36 text-gray-50">전체 사용자</h1>

          <UserListSection />
        </main>
      </div>
    </div>
  );
}
