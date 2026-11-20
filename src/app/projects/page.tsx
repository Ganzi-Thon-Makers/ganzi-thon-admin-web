import { Suspense } from 'react';

import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Icon } from '@/components/ui/icon';
import { getServerAuthSession, getServerAuthTokens } from '@/lib/auth/cookies';

import { ProjectListClient } from './_components/project-list-client';
import { requestProjectList } from './_data/project-api';

export const instant = false;

/** 전체 목록을 조회해 검색 결과의 순위 기준을 준비합니다. */
async function ProjectListData({ searchParams }: Pick<PageProps<'/projects'>, 'searchParams'>) {
  const { accessToken } = await getServerAuthTokens();
  if (!accessToken)
    return (
      <p role="alert" className="text-body-r-16 text-red-400">
        로그인이 필요합니다. 다시 로그인해주세요.
      </p>
    );

  const result = await requestProjectList(accessToken);
  if (!result.ok)
    return (
      <p role="alert" className="text-body-r-16 text-red-400">
        {result.message}
      </p>
    );
  const params = await searchParams;
  const initialKeyword = typeof params.keyword === 'string' ? params.keyword.trim() : '';
  return <ProjectListClient projects={result.data} initialKeyword={initialKeyword} />;
}

/** ADMIN-03 프로젝트 목록 및 검색 화면입니다. */
export default async function ProjectsPage({ searchParams }: PageProps<'/projects'>) {
  const { role } = await getServerAuthSession();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={sidebarVariant}
        activeMenuId="projects"
        className="sticky top-0 h-screen min-h-0 self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 border-b border-gray-800 bg-gray-800 px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>
        <main className="flex-1 px-10 pt-12 pb-10 xl:px-16">
          <h1 className="mb-6 text-display-sb-36 text-gray-50">프로젝트 목록</h1>
          <Suspense
            fallback={
              <p role="status" className="text-body-r-16 text-gray-300">
                프로젝트 목록을 불러오는 중입니다...
              </p>
            }
          >
            <ProjectListData searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
