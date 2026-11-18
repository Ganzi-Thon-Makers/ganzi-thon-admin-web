import { Icon } from '@/components/ui/icon';

export interface UserTableItem {
  /** 사용자 이름 */
  name: string;
  /** 소속 학교 */
  school: string;
  /** 연락처 */
  phoneNumber: string;
  /** 럭키드로우 응모 여부 */
  hasEnteredLuckyDraw: boolean;
  /** 교육 수료 여부 */
  hasCompletedCourse: boolean;
  /** 소속 팀 번호 */
  teamNumber: string;
  /** 상세 페이지 이동에 사용할 사용자 식별자 */
  id: string;
}

export interface UserTableProps {
  /** 표에 표시할 사용자 목록 */
  users: UserTableItem[];
  /** 상세 보기 선택 시 호출할 콜백 */
  onViewDetails: (userId: string) => void;
}

/** 전체 사용자 목록을 Figma 디자인의 테이블 형태로 표시합니다. */
export function UserTable({ users, onViewDetails }: UserTableProps) {
  /** 사용자 상세 보기 버튼 선택을 해당 사용자 식별자와 함께 전달합니다.
   * @param userId 상세 페이지를 열 사용자 식별자
   */
  function handleViewDetails(userId: string) {
    onViewDetails(userId);
  }

  /** 사용자 행을 렌더링합니다.
   * @param user 표시할 사용자 정보
   * @returns 사용자 정보와 상세 보기 링크를 포함한 표 행
   */
  function renderUserRow(user: UserTableItem) {
    /** 현재 행 사용자의 상세 보기 요청을 전달합니다. */
    function handleRowDetailsClick() {
      handleViewDetails(user.id);
    }

    return (
      <tr key={user.id} className="h-[72px] align-middle text-body-r-16 text-gray-100">
        <th scope="row" className="px-6 text-left text-body-sb-16 text-gray-50">
          {user.name}
        </th>
        <td className="px-6 text-left">{user.school}</td>
        <td className="px-6 text-left">{user.phoneNumber}</td>
        <td className="px-6 text-left">
          <span className={user.hasEnteredLuckyDraw ? 'text-red-500' : 'text-gray-400'}>
            {user.hasEnteredLuckyDraw ? '응모 완료' : '미응모'}
          </span>
        </td>
        <td className="px-6 text-left">
          <span className={user.hasCompletedCourse ? 'text-red-500' : 'text-gray-400'}>
            {user.hasCompletedCourse ? '수료 완료' : '미수료'}
          </span>
        </td>
        <td className="px-6 text-left">{user.teamNumber}</td>
        <td className="px-6 text-right">
          <button
            type="button"
            onClick={handleRowDetailsClick}
            className="inline-flex items-center gap-1 text-body-r-16 text-gray-100 transition-colors hover:text-static-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            aria-label={`${user.name} 상세 보기`}
          >
            상세 보기
            <Icon name="chevron-right" size={24} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <table className="w-full min-w-[1200px] table-fixed border-collapse text-left font-sans">
      <colgroup>
        <col className="w-[13%]" />
        <col className="w-[17%]" />
        <col className="w-[19%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col className="w-[10%]" />
        <col className="w-[13%]" />
      </colgroup>
      <thead className="h-14 bg-gray-700 text-body-m-16 text-gray-300">
        <tr>
          <th scope="col" className="px-6 font-medium">
            이름 (가나다)
          </th>
          <th scope="col" className="px-6 font-medium">
            학교
          </th>
          <th scope="col" className="px-6 font-medium">
            전화번호
          </th>
          <th scope="col" className="px-6 font-medium">
            럭키드로우
          </th>
          <th scope="col" className="px-6 font-medium">
            수료 여부
          </th>
          <th scope="col" className="px-6 font-medium">
            팀번호
          </th>
          <th scope="col" className="px-6 font-medium" aria-label="상세 보기" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800">
        {users.length > 0 ? (
          users.map(renderUserRow)
        ) : (
          <tr>
            <td colSpan={7} className="h-56 text-center text-body-r-16 text-gray-400">
              표시할 사용자가 없습니다.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
