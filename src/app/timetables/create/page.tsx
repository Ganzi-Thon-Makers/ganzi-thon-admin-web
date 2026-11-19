import { io } from 'next/cache';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Icon } from '@/components/ui/icon';
import { getServerAuthSession } from '@/lib/auth/cookies';

import { TimetableForm } from '../_components/timetable-form';
import { getTimetableList } from '../_data/timetable-api';

export const instant = false;

/**
 * 일정 중복 검증에 필요한 타임테이블 목록을 서버에서 조회하여 폼에 전달하는 서버 컴포넌트입니다.
 *
 * 목록 조회가 성공하면 해당 데이터를 전달하고, 실패하면 빈 초기값으로 폼을 렌더링합니다.
 */
async function TimetableCreateData() {
  const result = await getTimetableList();
  await io();
  return <TimetableForm initialTimetables={result.ok ? result.data : undefined} />;
}

/**
 * 타임테이블 일정 등록 화면을 제공하는 페이지 컴포넌트입니다.
 *
 * 슈퍼 관리자 권한을 검증하고 권한이 없으면 메인 페이지로 이동합니다.
 */
export default async function TimetableCreatePage() {
  const { role } = await getServerAuthSession();
  if (role !== 'SUPER_ADMIN') redirect('/');

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant="superadmin"
        activeMenuId="timetable"
        className="sticky top-0 h-screen min-h-0 self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 border-b border-gray-800 bg-gray-800 px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>
        <main className="flex-1 px-6 pt-12 pb-10 md:px-10 xl:px-16">
          <h1 className="mb-7 text-display-sb-36 text-gray-50">일정 등록</h1>
          <Suspense fallback={<TimetableForm />}>
            <TimetableCreateData />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
