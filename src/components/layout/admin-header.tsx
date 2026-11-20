import { AdminHeaderContent } from '@/components/layout/admin-header-content';
import { getServerAuthTokens } from '@/lib/auth/cookies';

/** 현재 인증된 관리자 아이디를 표시하는 서버 헤더입니다.
 * @returns 로그인 아이디가 연결된 관리자 헤더
 */
export async function AdminHeader() {
  const { loginId } = await getServerAuthTokens();

  return <AdminHeaderContent loginId={loginId} />;
}
