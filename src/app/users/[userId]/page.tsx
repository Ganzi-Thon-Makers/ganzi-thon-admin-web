import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { UserDetailView } from '@/features/users/components/user-detail-view';
import { getServerAuthTokens } from '@/lib/auth/cookies';

import { requestUserDetail } from '../_data/user-api';

export const instant = false;

interface UserDetailPageProps {
  /** 동적 사용자 상세 경로 매개변수 */
  params: Promise<{ userId: string }>;
}

/** URL의 식별자에 해당하는 사용자 상세 페이지를 렌더링합니다.
 * @param props 상세 경로 매개변수
 * @returns 사용자 상세 UI 또는 사용자 없음 화면
 */
export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  if (!/^[1-9]\d*$/.test(userId) || !Number.isSafeInteger(Number(userId))) notFound();

  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken || !role) redirect('/');

  const result = await requestUserDetail(accessToken, userId);
  if (!result.ok) {
    if (result.status === 404) notFound();

    const authenticationError = result.status === 401;
    const forbidden = result.status === 403;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-900 px-6 text-center text-gray-50">
        <h1 className="text-display-sb-32">
          {authenticationError
            ? '로그인이 만료되었습니다'
            : forbidden
              ? '사용자 정보를 조회할 권한이 없습니다'
              : '사용자 정보를 불러오지 못했습니다'}
        </h1>
        <p className="text-body-r-16 text-gray-300">
          {authenticationError
            ? '다시 로그인해 주세요.'
            : forbidden
              ? '계정 권한을 확인해 주세요.'
              : '잠시 후 다시 시도해 주세요.'}
        </p>
        <Link
          href={authenticationError ? '/' : '/users'}
          className="text-body-sb-16 text-red-400 underline"
        >
          {authenticationError ? '로그인으로 이동' : '사용자 목록으로 이동'}
        </Link>
      </main>
    );
  }

  return (
    <UserDetailView user={result.data} role={role === 'SUPER_ADMIN' ? 'superadmin' : 'admin'} />
  );
}
