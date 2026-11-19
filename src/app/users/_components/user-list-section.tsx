'use client';

import { useRouter } from 'next/navigation';

import { UserListClient } from './user-list-client';
import type { UserTableItem } from './user-table';

interface UserListSectionProps {
  users: UserTableItem[];
}

/** 사용자 목록의 클라이언트 동작을 렌더링합니다. */
export function UserListSection({ users }: UserListSectionProps) {
  const router = useRouter();

  /** 사용자 상세 보기 선택 시 해당 사용자의 상세 페이지로 이동합니다.
   * @param userId 선택된 사용자의 식별자
   */
  function handleViewUserDetails(userId: string) {
    router.push(`/users/${encodeURIComponent(userId)}`);
  }

  return <UserListClient users={users} onViewDetails={handleViewUserDetails} />;
}
