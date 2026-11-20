import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AdminHeader } from '@/components/layout/admin-header';
import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { getServerAuthSession } from '@/lib/auth/cookies';

import { VoteScheduleLoading, VoteScheduleSection } from './_components/vote-schedule';

export const instant = false;

export default async function VotesPage() {
  const { role } = await getServerAuthSession();

  if (role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant="superadmin"
        activeMenuId="votes"
        className="sticky top-0 h-screen min-h-0 self-start"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="group flex-1 px-6 pt-12 pb-10 md:px-10 xl:px-16">
          <h1 className="mb-7 text-[32px] leading-[42px] font-semibold tracking-[-0.01em] text-gray-50">
            <span className="group-has-data-vote-editing:hidden">투표 관리</span>
            <span className="hidden group-has-data-vote-editing:inline">투표 시간 수정</span>
          </h1>
          <Suspense fallback={<VoteScheduleLoading />}>
            <VoteScheduleSection />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
