import { Suspense } from 'react';

import { UserCreateForm } from '@/features/users/components/user-create-form';
import { getServerAuthSession } from '@/lib/auth/cookies';

/** 사용자 등록 페이지를 표시합니다. */
export default function UserCreatePage() {
  return (
    <Suspense fallback={<UserCreateForm />}>
      <UserCreateFormWithSession />
    </Suspense>
  );
}

/**
 * 인증 세션 역할을 확인해 사용자 등록 화면의 사이드바 변형을 정합니다.
 * @returns 역할에 맞는 사이드바를 포함한 사용자 등록 화면
 */
async function UserCreateFormWithSession() {
  const { role } = await getServerAuthSession();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return <UserCreateForm sidebarVariant={sidebarVariant} />;
}
