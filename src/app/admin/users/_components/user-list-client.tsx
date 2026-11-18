'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

import { UserFilters, type UserStatusFilter } from './user-filters';
import { UserTable, type UserTableItem } from './user-table';

const USERS_PER_PAGE = 8;

export interface UserListClientProps {
  /** 검색 및 필터할 사용자 원본 목록 */
  users: UserTableItem[];
  /** 사용자 상세 보기 선택 콜백 */
  onViewDetails: (userId: string) => void;
}

/** 검색어와 상태 필터에 맞는 사용자 판별 함수를 만듭니다.
 * @param normalizedSearchTerm 앞뒤 공백을 제거한 검색어
 * @param luckyDrawFilter 응모 여부 필터
 * @param completionFilter 수료 여부 필터
 * @returns 사용자별 일치 여부를 확인하는 함수
 */
function createUserFilterPredicate(
  normalizedSearchTerm: string,
  luckyDrawFilter: UserStatusFilter,
  completionFilter: UserStatusFilter,
): (user: UserTableItem) => boolean {
  /** 이름과 두 상태 필터가 모두 일치하는지 확인합니다.
   * @param user 검사할 사용자
   * @returns 모든 검색 및 필터 조건에 일치하면 true
   */
  function matchesUserFilters(user: UserTableItem) {
    const matchesName = user.name.includes(normalizedSearchTerm);
    const matchesLuckyDraw =
      luckyDrawFilter === 'all' || user.hasEnteredLuckyDraw === (luckyDrawFilter === 'yes');
    const matchesCompletion =
      completionFilter === 'all' || user.hasCompletedCourse === (completionFilter === 'yes');

    return matchesName && matchesLuckyDraw && matchesCompletion;
  }

  return matchesUserFilters;
}

/** 두 사용자의 이름을 한국어 가나다순으로 비교합니다.
 * @param firstUser 비교할 첫 번째 사용자
 * @param secondUser 비교할 두 번째 사용자
 * @returns 가나다순 정렬에 사용할 비교 결과
 */
function compareUsersByName(firstUser: UserTableItem, secondUser: UserTableItem) {
  return firstUser.name.localeCompare(secondUser.name, 'ko-KR');
}

/** 검색어와 상태 필터를 적용한 사용자 목록을 표시합니다. */
export function UserListClient({ users, onViewDetails }: UserListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [luckyDrawFilter, setLuckyDrawFilter] = useState<UserStatusFilter>('all');
  const [completionFilter, setCompletionFilter] = useState<UserStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const hasStatusFilter = luckyDrawFilter !== 'all' || completionFilter !== 'all';

  // 검색어 및 상태 필터를 적용한 뒤 이름 가나다순으로 정렬합니다.
  const filteredUsers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim();

    return users
      .filter(createUserFilterPredicate(normalizedSearchTerm, luckyDrawFilter, completionFilter))
      .toSorted(compareUsersByName);
  }, [users, searchTerm, luckyDrawFilter, completionFilter]);

  const pageCount = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const pageStartIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(pageStartIndex, pageStartIndex + USERS_PER_PAGE);

  /** 검색어가 바뀌면 검색 상태를 갱신하고 첫 페이지로 이동합니다.
   * @param value 변경된 이름 검색어
   */
  function handleSearchTermChange(value: string) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  /** 응모 필터가 바뀌면 선택값을 갱신하고 첫 페이지로 이동합니다.
   * @param value 변경된 응모 여부 필터
   */
  function handleLuckyDrawFilterChange(value: UserStatusFilter) {
    setLuckyDrawFilter(value);
    setCurrentPage(1);
  }

  /** 수료 필터가 바뀌면 선택값을 갱신하고 첫 페이지로 이동합니다.
   * @param value 변경된 수료 여부 필터
   */
  function handleCompletionFilterChange(value: UserStatusFilter) {
    setCompletionFilter(value);
    setCurrentPage(1);
  }

  /** 페이지네이션에서 선택한 페이지를 현재 페이지로 설정합니다.
   * @param page 선택한 페이지 번호
   */
  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  /** CSV 셀을 수식 실행 없이 열 수 있도록 안전하게 인용합니다.
   * @param value CSV 셀에 넣을 원본 값
   * @returns 따옴표와 수식 방지 처리가 적용된 CSV 셀
   */
  function escapeCsvCell(value: string) {
    const safeValue = /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replace(/"/g, '""')}"`;
  }

  /** 사용자 정보를 Figma의 지정된 열 순서에 맞춘 CSV 행으로 만듭니다.
   * @param user CSV로 내보낼 사용자
   * @returns CSV 열 순서에 맞춘 사용자 값 배열
   */
  function getUserCsvRow(user: UserTableItem) {
    return [
      user.name,
      user.school,
      user.phoneNumber,
      user.hasEnteredLuckyDraw ? '응모 완료' : '미응모',
      user.hasCompletedCourse ? '수료 완료' : '미수료',
      user.teamNumber,
    ];
  }

  /** CSV 행의 각 셀을 이스케이프하고 쉼표로 연결합니다.
   * @param row CSV로 인코딩할 셀 값 목록
   * @returns 이스케이프된 CSV 한 줄
   */
  function encodeCsvRow(row: string[]) {
    return row.map(escapeCsvCell).join(',');
  }

  /** 현재 검색·필터 결과 전체를 UTF-8 BOM이 포함된 CSV 파일로 내려받습니다. */
  function handleDownloadUsers() {
    const headers = ['이름', '학교', '전화번호', '럭키드로우', '수료 여부', '팀번호'];
    const rows = filteredUsers.map(getUserCsvRow);
    const csvContent = [headers, ...rows].map(encodeCsvRow).join('\r\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    downloadLink.href = objectUrl;
    downloadLink.download = `admin-users-${year}-${month}-${day}.csv`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    /** 다운로드가 시작된 다음 임시 Blob 주소를 해제합니다. */
    function handleRevokeObjectUrl() {
      URL.revokeObjectURL(objectUrl);
    }

    window.setTimeout(handleRevokeObjectUrl, 0);
  }

  return (
    <div className="flex flex-col">
      <div className={`flex flex-wrap items-start gap-4 ${hasStatusFilter ? 'mb-2' : 'mb-7'}`}>
        <div className="min-w-0 flex-1">
          <UserFilters
            searchTerm={searchTerm}
            onSearchTermChange={handleSearchTermChange}
            luckyDrawFilter={luckyDrawFilter}
            onLuckyDrawFilterChange={handleLuckyDrawFilterChange}
            completionFilter={completionFilter}
            onCompletionFilterChange={handleCompletionFilterChange}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasStatusFilter || filteredUsers.length === 0}
            onClick={handleDownloadUsers}
            className={`h-12 w-40 rounded-[4px] px-6 text-body-sb-16 text-static-white enabled:cursor-pointer ${
              hasStatusFilter && filteredUsers.length > 0
                ? 'bg-gray-700 hover:bg-gray-700 active:bg-gray-700'
                : 'disabled:bg-gray-300 disabled:text-static-white'
            }`}
          >
            목록 다운로드
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            aria-disabled="true"
            aria-describedby="user-add-unavailable"
            className="h-12 w-40 rounded-[4px] bg-red-500 px-6 text-body-sb-16 text-static-white hover:bg-red-500 active:bg-red-500 aria-disabled:cursor-not-allowed"
          >
            사용자 추가
          </Button>
          <span id="user-add-unavailable" className="sr-only">
            사용자 추가 기능은 아직 사용할 수 없습니다.
          </span>
        </div>
      </div>

      <div className="mb-7 overflow-x-auto">
        <UserTable users={paginatedUsers} onViewDetails={onViewDetails} />
      </div>

      {filteredUsers.length > 0 && pageCount > 1 ? (
        <Pagination
          pageCount={pageCount}
          page={currentPage}
          onPageChange={handlePageChange}
          className="justify-center [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer"
        />
      ) : null}
    </div>
  );
}
