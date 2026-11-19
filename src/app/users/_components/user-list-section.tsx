'use client';

import { mockUsers } from '../_data/users';
import { UserListClient } from './user-list-client';

/** 사용자 목록의 클라이언트 동작을 렌더링합니다. */
export function UserListSection() {
  /** 사용자 상세 보기 선택을 현재 콘솔에서 확인할 수 있도록 기록합니다.
   * @param userId 선택된 사용자의 식별자
   * @returns 반환값 없음
   */
  function handleViewUserDetails(userId: string) {
    console.log('사용자 상세 보기 선택:', userId);
  }

  return <UserListClient users={mockUsers} onViewDetails={handleViewUserDetails} />;
}
