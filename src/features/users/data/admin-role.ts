import type { AdminRole } from '../types/user';

/** 개발 환경 전용 테스트 역할을 반환합니다. 프로덕션 권한 검증에는 사용할 수 없습니다.
 * @returns 개발 서버에서 요청한 사용자 역할
 */
export function getAdminRole(): AdminRole {
  if (process.env.NODE_ENV !== 'development') {
    return 'admin';
  }

  return process.env.NEXT_PUBLIC_ADMIN_ROLE === 'superadmin' ? 'superadmin' : 'admin';
}
