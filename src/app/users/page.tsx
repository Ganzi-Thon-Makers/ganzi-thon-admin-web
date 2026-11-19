import { Suspense } from 'react';

import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Icon } from '@/components/ui/icon';
import { getServerAuthSession, getServerAuthTokens } from '@/lib/auth/cookies';

import { UserListSection } from './_components/user-list-section';
import { requestUserList } from './_data/user-api';

export const instant = false;

/** 전체 목록을 조회하고 API 오류를 목록 영역에 표시합니다. */
async function UserListData({ searchParams }: Pick<PageProps<'/users'>, 'searchParams'>) {
  const { accessToken } = await getServerAuthTokens();
  if (!accessToken) {
    return (
      <p role="alert" className="text-body-r-16 text-red-400">
        로그인이 필요합니다. 다시 로그인해주세요.
      </p>
    );
  }

  const params = await searchParams;
  /** URL에 지정된 상태 조건을 API 필터로 변환합니다.
   * @param value URL의 필터 값
   * @returns 선택한 상태 또는 전체 조회를 뜻하는 undefined
   */
  function readStatus(value: string | string[] | undefined) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  const initialQuery = {
    keyword: typeof params.keyword === 'string' ? params.keyword.trim() : '',
    luckyDrawEntered: readStatus(params.luckyDrawEntered),
    completed: readStatus(params.completed),
  };
  const result = await requestUserList(accessToken, initialQuery);
  if (!result.ok) {
    return (
      <p role="alert" className="text-body-r-16 text-red-400">
        {result.message}
      </p>
    );
  }

  return (
    <UserListSection
      key={JSON.stringify(initialQuery)}
      users={result.data}
      initialQuery={initialQuery}
    />
  );
}

/** ADMIN-02-1 전체 사용자 조회 기본 화면입니다. */
export default async function UsersPage({ searchParams }: PageProps<'/users'>) {
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

          <Suspense
            fallback={
              <p role="status" className="text-body-r-16 text-gray-300">
                사용자 목록을 불러오는 중입니다...
              </p>
            }
          >
            <UserListData searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
