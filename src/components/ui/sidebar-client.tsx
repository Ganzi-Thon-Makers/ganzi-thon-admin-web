'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type HTMLAttributes, type MouseEvent, type ReactNode, useState } from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * 관리자 사이드바 역할 변형 타입
 */
export type SidebarVariant = 'admin' | 'superadmin';

export interface SidebarNavItem {
  /** 메뉴 고유 식별자 */
  id: string;
  /** 메뉴 표시 이름 */
  label: string;
  /** 아이콘 이름 */
  icon: IconName;
  /** 아이콘 크기 */
  iconSize?: number;
  /** 이동할 링크 경로 */
  href?: string;
}

export interface SidebarClientProps extends HTMLAttributes<HTMLElement> {
  /** 사이드바 역할 변형 (기본값: `'admin'`) */
  variant?: SidebarVariant;
  /** 현재 활성화된 메뉴 ID */
  activeMenuId?: string;
  /** 메뉴 항목 선택 콜백 */
  onSelectMenu?: (menuId: string) => void;
  /** 로그아웃 클릭 콜백 */
  onLogout?: () => void;
  /** 커스텀 메뉴 항목 목록 */
  customNavItems?: SidebarNavItem[];
}

interface SidebarNavItemButtonProps {
  /** 내비게이션 아이템 정보 */
  item: SidebarNavItem;
  /** 활성화 여부 */
  isActive: boolean;
  /** 메뉴 선택 콜백 */
  onSelect: (id: string) => void;
}

/**
 * 관리자 사이드바의 개별 내비게이션 메뉴 컴포넌트입니다.
 *
 * 링크 경로(`href`) 유무에 따라 Link 또는 button 요소로 렌더링합니다.
 */
function SidebarNavItemButton({ item, isActive, onSelect }: SidebarNavItemButtonProps) {
  /**
   * 메뉴 항목 클릭 시 부모 콜백으로 메뉴 ID를 전달합니다.
   */
  const handleItemClick = () => {
    onSelect(item.id);
  };

  const className = cn(
    'flex w-54 shrink-0 cursor-pointer items-center gap-3 rounded-md p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
    isActive
      ? 'bg-red-500 text-white hover:bg-red-500 active:bg-red-500'
      : 'bg-transparent text-white hover:bg-gray-700 active:bg-gray-700',
  );
  const content = (
    <>
      <Icon name={item.icon} size={item.iconSize} />
      <span className="truncate text-body-sb-16 leading-normal font-semibold tracking-[-0.16px]">
        {item.label}
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={handleItemClick}
        aria-current={isActive ? 'page' : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleItemClick}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      {content}
    </button>
  );
}

/** 부스 관리자 기본 내비게이션 메뉴 목록 */
const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: 'users',
    label: '사용자',
    icon: 'user',
    iconSize: 22,
    href: '/users',
  },
  {
    id: 'projects',
    label: '프로젝트 관리',
    icon: 'card',
  },
  {
    id: 'booths',
    label: '부스 관리',
    icon: 'house',
  },
];

/** 슈퍼 관리자 기본 내비게이션 메뉴 목록 */
const SUPERADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: 'users',
    label: '사용자 관리',
    icon: 'user',
    iconSize: 22,
    href: '/users',
  },
  {
    id: 'projects',
    label: '프로젝트 관리',
    icon: 'card',
  },
  {
    id: 'votes',
    label: '투표 관리',
    icon: 'stamp',
    href: '/votes',
  },
  {
    id: 'timetable',
    label: '타임테이블 관리',
    icon: 'cock',
  },
  {
    id: 'booths',
    label: '부스 관리',
    icon: 'house',
  },
];

/**
 * 부스 관리자와 슈퍼 관리자 역할을 지원하는 공용 SidebarClient 컴포넌트입니다.
 *
 * 전달된 variant에 따라 기본 내비게이션 메뉴와 브랜드 로고를 다르게 렌더링하며,
 * 메뉴 선택 및 로그아웃 이벤트를 상위로 전달합니다.
 *
 * @example
 * ```tsx
 * <SidebarClient
 *   variant="sidebar"
 *   activeMenuId="users"
 *   onSelectMenu={(id) => console.log(id)}
 * />
 * ```
 */
export function SidebarClient({
  className,
  variant = 'admin',
  activeMenuId,
  onSelectMenu,
  onLogout,
  customNavItems,
  ...props
}: SidebarClientProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>(activeMenuId ?? '');

  const currentActiveId = activeMenuId ?? internalActiveId;

  /**
   * 메뉴 항목을 선택했을 때 활성 ID를 변경하고 외부 콜백을 호출합니다.
   * @param menuId 선택된 메뉴 식별자
   */
  const handleSelectMenu = (menuId: string) => {
    if (activeMenuId === undefined) {
      setInternalActiveId(menuId);
    }
    onSelectMenu?.(menuId);
  };

  /**
   * 로그아웃 버튼 클릭 이벤트를 처리하고 외부 onLogout 콜백을 호출합니다.
   * @param event 버튼 클릭 마우스 이벤트 객체
   */
  const handleLogoutClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onLogout?.();
  };

  /**
   * 개별 내비게이션 아이템 노드를 렌더링합니다.
   * @param item 내비게이션 아이템 정보 객체
   * @returns 렌더링된 컴포넌트 노드
   */
  const renderNavItem = (item: SidebarNavItem): ReactNode => {
    return (
      <SidebarNavItemButton
        key={item.id}
        item={item}
        isActive={currentActiveId === item.id}
        onSelect={handleSelectMenu}
      />
    );
  };

  const navItems =
    customNavItems ?? (variant === 'superadmin' ? SUPERADMIN_NAV_ITEMS : SIDEBAR_NAV_ITEMS);

  return (
    <aside
      className={cn(
        'relative flex h-full min-h-screen w-64 shrink-0 flex-col items-start gap-3 bg-gray-800 px-5 pt-10 pb-8',
        className,
      )}
      {...props}
    >
      <div className="flex w-54 shrink-0 flex-col items-start px-4 pt-4 pb-11">
        <div className="flex shrink-0 flex-col items-start">
          <div className="relative size-14 shrink-0 overflow-clip bg-gray-800">
            <div className="absolute top-1/2 left-[calc(50%-0.16px)] h-7 w-[33.911px] -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/admin/logo_favicon.svg"
                alt="Arithon Favicon"
                width={34}
                height={28}
                className="absolute inset-0 block size-full max-w-none"
                unoptimized
              />
            </div>
          </div>

          <div className="flex shrink-0 items-end gap-2">
            <div className="relative h-[16.414px] w-[73.763px] shrink-0">
              <Image
                src="/admin/arithon_wordmark.svg"
                alt="Arithon"
                width={74}
                height={16}
                className="absolute inset-0 block size-full max-w-none"
                unoptimized
              />
            </div>

            <div
              className={cn(
                'relative flex shrink-0 items-center',
                variant === 'superadmin' ? '' : 'justify-center',
              )}
            >
              <div
                className={cn(
                  variant === 'superadmin'
                    ? 'relative -mr-0.5 h-4 w-[59px] shrink-0'
                    : 'flex-none -scale-y-100',
                )}
              >
                {variant === 'admin' ? (
                  <div className="relative h-[15.359px] w-[61px]">
                    <Image
                      src="/admin/admin_black_vector.svg"
                      alt="Admin"
                      width={61}
                      height={15}
                      className="absolute inset-0 block size-full max-w-none"
                      unoptimized
                    />
                  </div>
                ) : null}

                {variant === 'superadmin' ? (
                  <div className="absolute top-0 left-[-1.76px] h-[20.152px] w-[58px]">
                    <Image
                      src="/admin/super.svg"
                      alt="Super"
                      width={58}
                      height={20}
                      className="absolute inset-0 block size-full max-w-none"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>

              {variant === 'superadmin' ? (
                <div className="relative flex shrink-0 items-center justify-center">
                  <div className="flex-none -scale-y-100">
                    <div className="relative h-[15.359px] w-[61px]">
                      <Image
                        src="/admin/admin_black_vector.svg"
                        alt="Admin"
                        width={61}
                        height={15}
                        className="absolute inset-0 block size-full max-w-none"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="사이드바 메뉴" className="flex flex-col gap-3">
        {navItems.map(renderNavItem)}
      </nav>

      <div className="min-h-px w-54 flex-1" aria-hidden="true" />

      <button
        type="button"
        onClick={handleLogoutClick}
        className="cursor-pointer text-body-r-14 leading-normal font-normal tracking-[-0.14px] text-gray-400 underline transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
      >
        로그아웃
      </button>
    </aside>
  );
}

export default SidebarClient;
