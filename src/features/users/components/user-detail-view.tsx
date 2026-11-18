import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sidebar } from '@/components/ui/sidebar';
import type { AdminRole, User } from '@/features/users/types/user';

interface UserDetailViewProps {
  /** 상세 화면에 표시할 사용자 정보 */
  user: User;
  /** 화면 버튼을 결정하는 표시용 관리자 역할 */
  role: AdminRole;
}

interface DetailItemProps {
  /** 정보 항목 제목 */
  label: string;
  /** 사용자 정보 값 */
  children: React.ReactNode;
}

/** 한 항목의 이름과 값을 상세 카드 안에 표시합니다.
 * @param props 정보 제목과 표시 값
 * @returns 상세 정보 항목
 */
function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <dt className="text-body-r-14 text-gray-300">{label}</dt>
      <dd className="text-title-m-20 text-gray-100">{children}</dd>
    </div>
  );
}

/** 사용자 상세 정보와 역할에 따른 준비 중인 관리 동작을 표시합니다.
 * @param props 사용자 정보와 테스트용 관리자 역할
 * @returns 사이드바와 상세 조회 화면
 */
export function UserDetailView({ user, role }: UserDetailViewProps) {
  const isSuperadmin = role === 'superadmin';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <Sidebar
        variant={role}
        activeMenuId="users"
        className="sticky top-0 h-screen min-h-0 self-start"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 bg-gray-800 px-6 sm:px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>

        <main className="flex-1 px-6 pt-10 pb-10 sm:px-10 xl:px-16 xl:pt-[90px]">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/users"
                aria-label="전체 사용자 목록으로 돌아가기"
                className="flex size-12 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon name="chevron-left" size={48} />
              </Link>
              <h1 className="text-display-sb-32 text-gray-50">사용자 상세</h1>
            </div>
          </div>

          <section
            aria-labelledby="user-profile-heading"
            className="rounded-[12px] bg-gray-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:p-8"
          >
            <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <h2 id="user-profile-heading" className="text-display-sb-28 text-gray-50">
                {user.name}
              </h2>
              <Badge
                color="none"
                size="medium"
                className="h-[29px] w-[52px] rounded-[4px] text-body-sb-14 text-gray-50"
              >{`${user.teamNumber}팀`}</Badge>
              <Badge
                color="red"
                size="medium"
                className="h-[29px] w-[55px] rounded-[4px] text-body-sb-14 text-gray-50"
              >
                {user.part}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 sm:gap-x-8">
              <DetailItem label="이름">{user.name}</DetailItem>
              <DetailItem label="아이디">{user.accountId}</DetailItem>
              <DetailItem label="학교">{user.school}</DetailItem>
              <DetailItem label="PWD">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span aria-label="비밀번호는 보안상 표시하지 않습니다">••••••••</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-title-m-20 text-gray-100">변경 시 새 비밀번호 입력</span>
                </span>
              </DetailItem>
              <DetailItem label="전화번호">{user.phoneNumber}</DetailItem>
              <DetailItem label="럭키드로우 응모 여부">
                <span className="text-gray-100">
                  {user.hasEnteredLuckyDraw ? '응모 완료' : '미응모'}
                </span>
              </DetailItem>
              <DetailItem label="팀번호 / 파트">{`${user.teamNumber}팀 / ${user.part}`}</DetailItem>
              <DetailItem label="수료 여부">
                <span className="text-gray-100">
                  {user.hasCompletedCourse ? '수료 완료' : '미수료'}
                </span>
              </DetailItem>
            </dl>
          </section>

          {isSuperadmin ? (
            <div className="mt-7 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled
                className="h-12 w-full bg-gray-700 px-6 text-body-sb-16 text-gray-50 disabled:bg-gray-700 disabled:text-gray-50 sm:w-[136px]"
              >
                사용자 삭제
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled
                className="h-12 w-full bg-red-500 px-6 text-body-sb-16 text-gray-50 disabled:bg-red-500 disabled:text-gray-50 sm:w-[136px]"
              >
                정보 수정
              </Button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
