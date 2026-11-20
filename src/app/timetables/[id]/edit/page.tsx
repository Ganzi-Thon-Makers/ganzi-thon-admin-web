import { io } from 'next/cache';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AdminHeader } from '@/components/layout/admin-header';
import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { getServerAuthSession } from '@/lib/auth/cookies';

import { TimetableForm } from '../../_components/timetable-form';
import { getTimetableList, validateTimetableId } from '../../_data/timetable-api';

export const instant = false;

/** 일정 수정 데이터 컴포넌트의 Props */
interface TimetableEditDataProps {
  /** 동적 라우트 매개변수 프로미스 */
  params: Promise<{ id: string }>;
}

/**
 * 식별자에 해당하는 일정과 전체 타임테이블 목록을 조회하여 수정 폼에 전달하는 서버 컴포넌트입니다.
 *
 * 일정 식별자가 유효하지 않거나 일정이 존재하지 않으면 404 페이지로 전환합니다.
 * @param props 라우트 매개변수 프로미스
 */
async function TimetableEditData({ params }: TimetableEditDataProps) {
  const { id } = await params;
  const validated = validateTimetableId(id);
  if (!validated.ok) notFound();
  const result = await getTimetableList();
  await io();
  if (!result.ok)
    return (
      <div role="alert">
        {result.message}{' '}
        <Link href="/timetables" className="underline">
          목록으로 돌아가기
        </Link>
      </div>
    );

  /**
   * 현재 수정 대상 식별자와 일치하는 일정인지 확인한다.
   * @param item 검사할 일정 항목
   * @returns 식별자 일치 여부
   */
  function matchesId(item: { id: number }) {
    return item.id === Number(id);
  }
  const timetable = result.data.find(matchesId);
  if (!timetable) notFound();
  return <TimetableForm key={id} initialTimetables={result.data} timetable={timetable} />;
}

/**
 * 타임테이블 일정 수정 화면을 제공하는 페이지 컴포넌트입니다.
 *
 * 슈퍼 관리자 권한을 검증하고 권한이 없으면 메인 페이지로 이동합니다.
 * @param props 페이지 라우트 매개변수
 */
export default async function TimetableEditPage({ params }: PageProps<'/timetables/[id]/edit'>) {
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
          <h1 className="mb-7 text-display-sb-36 text-gray-50">일정 수정</h1>
          <Suspense fallback={<p role="status">일정을 불러오는 중입니다...</p>}>
            <TimetableEditData params={params} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
