import { Icon } from '@/components/ui/icon';

interface AdminHeaderContentProps {
  loginId?: string;
}

/** 전달된 로그인 아이디를 관리자 헤더에 표시합니다.
 * @param props 헤더에 표시할 로그인 아이디
 * @returns 관리자 헤더 UI
 */
export function AdminHeaderContent({ loginId }: AdminHeaderContentProps) {
  return (
    <header className="flex h-22 shrink-0 items-center justify-end gap-4 border-b border-gray-800 bg-gray-800 px-6 sm:px-10">
      <span
        className="max-w-[min(40vw,20rem)] truncate text-body-m-16 text-gray-50"
        title={loginId}
      >
        {loginId || '운영 관리자'}
      </span>
      <Icon name="user" size={32} />
    </header>
  );
}
