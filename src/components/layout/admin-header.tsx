import { Icon } from '@/components/ui/icon';
interface AdminHeaderProps {
  loginId?: string;
}

/** 관리자 로그인 아이디를 표시하는 공통 헤더입니다. */
export function AdminHeader({ loginId }: AdminHeaderProps) {
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
