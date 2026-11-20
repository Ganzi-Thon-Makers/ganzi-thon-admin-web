'use client';

import { useRouter } from 'next/navigation';

import type { UserListQuery } from '../_data/user-api';
import { UserListClient } from './user-list-client';
import type { UserTableItem } from './user-table';

interface UserListSectionProps {
  users: UserTableItem[];
  initialQuery: UserListQuery;
}

/** 사용자 목록의 클라이언트 동작을 렌더링합니다. */
export function UserListSection({ users, initialQuery }: UserListSectionProps) {
  const router = useRouter();

  /** 사용자 상세 보기 선택 시 해당 사용자의 상세 페이지로 이동합니다.
   * @param userId 선택된 사용자의 식별자
   */
  function handleViewUserDetails(userId: string) {
    router.push(`/users/${encodeURIComponent(userId)}`);
  }

  return (
    <UserListClient
      initialQuery={initialQuery}
      users={users}
      onViewDetails={handleViewUserDetails}
    />
  );
}
