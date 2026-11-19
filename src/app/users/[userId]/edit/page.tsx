import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getUserDetail } from '@/features/users/api/get-user-detail';
import { UserEditForm } from '@/features/users/components/user-edit-form';
import { getServerAuthTokens } from '@/lib/auth/cookies';

export const instant = false;

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

/** 슈퍼 어드민에게만 참여자 수정 화면을 제공합니다. */
export default async function UserEditPage({ params }: UserEditPageProps) {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken || !role) redirect('/');
  if (role !== 'SUPER_ADMIN') redirect('/users');

  const { userId } = await params;
  if (!/^[1-9]\d*$/.test(userId) || !Number.isSafeInteger(Number(userId))) notFound();

  const result = await getUserDetail(userId, accessToken);
  if (!result.ok) {
    if (result.status === 404) notFound();
    const authenticationError = result.status === 401;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-900 px-6 text-center text-gray-50">
        <h1 className="text-display-sb-32">
          {authenticationError
            ? '로그인이 만료되었습니다'
            : result.status === 403
              ? '사용자 정보를 조회할 권한이 없습니다'
              : '사용자 정보를 불러오지 못했습니다'}
        </h1>
        <Link
          href={authenticationError ? '/' : '/users'}
          className="text-body-sb-16 text-red-400 underline"
        >
          {authenticationError ? '로그인으로 이동' : '사용자 목록으로 이동'}
        </Link>
      </main>
    );
  }

  return <UserEditForm user={result.user} />;
}
