import { notFound } from 'next/navigation';

import { UserDetailView } from '@/features/users/components/user-detail-view';
import { getMockUserById } from '@/features/users/data/mock-users';
import { getServerAuthSession } from '@/lib/auth/cookies';

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
  const user = getMockUserById(userId);

  if (!user) {
    notFound();
  }

  const { role } = await getServerAuthSession();
  const pageRole = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return <UserDetailView user={user} role={pageRole} />;
}
