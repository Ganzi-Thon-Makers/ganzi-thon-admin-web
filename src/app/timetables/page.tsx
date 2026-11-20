import { io } from 'next/cache';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AdminHeader } from '@/components/layout/admin-header';
import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { getServerAuthSession } from '@/lib/auth/cookies';

import { TimetableListClient, TimetableListLoading } from './_components/timetable-list-client';
import { getTimetableList } from './_data/timetable-api';

export const instant = false;

async function TimetableListData() {
  const result = await getTimetableList();
  await io();
  return result.ok ? (
    <TimetableListClient initialTimetables={result.data} />
  ) : (
    <TimetableListClient initialErrorMessage={result.message} />
  );
}

export default async function TimetablesPage() {
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
        <AdminHeader />
        <main className="flex-1 px-6 pt-12 pb-10 md:px-10 xl:px-16">
          <h1 className="mb-7 text-display-sb-36 text-gray-50">타임테이블 관리</h1>
          <Suspense fallback={<TimetableListLoading />}>
            <TimetableListData />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
