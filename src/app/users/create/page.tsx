import { UserCreateForm } from '@/features/users/components/user-create-form';
import { getServerAuthSession } from '@/lib/auth/cookies';

/** 사용자 등록 페이지를 표시합니다. */
export default async function UserCreatePage() {
  const { role } = await getServerAuthSession();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return <UserCreateForm sidebarVariant={sidebarVariant} />;
}
