import { Suspense } from 'react';

import { getServerAuthSession } from '@/lib/auth/cookies';

import { BoothListClient, BoothListLoading } from './_components/booth-list-client';
import { BoothPageShell } from './_components/booth-page-shell';
import { getBoothList } from './_data/booth-api';

export const instant = false;

/**
 * 서버에서 초기 부스 현황을 조회해 클라이언트 부스 화면에 전달합니다.
 */
async function BoothListData() {
  const result = await getBoothList();
  return result.ok ? (
    <BoothListClient initialZones={result.data} />
  ) : (
    <BoothListClient initialErrorMessage={result.message} />
  );
}

/** ADMIN-06-1 부스 관리(Zone 1 / Zone 2 / Zone 3) 및 우측 상세 패널 화면입니다. */
export default async function BoothsPage() {
  const { role } = await getServerAuthSession();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return (
    <BoothPageShell sidebarVariant={sidebarVariant}>
      <h1 className="mb-6 text-display-sb-36 text-gray-50">부스 관리</h1>
      <Suspense fallback={<BoothListLoading />}>
        <BoothListData />
      </Suspense>
    </BoothPageShell>
  );
}
