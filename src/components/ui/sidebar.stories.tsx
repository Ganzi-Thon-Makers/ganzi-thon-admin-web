import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Sidebar } from '@/components/ui/sidebar';

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 일반 관리자 및 최고 관리자 사이드바 변형을 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 사이드바 변형 목록을 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex h-screen gap-8 overflow-hidden bg-gray-900 p-8">
      <div className="flex h-full min-h-0 flex-col gap-2">
        <span className="text-body-sb-14 text-gray-400">Admin</span>
        <div className="min-h-0 w-64 flex-1">
          <Sidebar variant="admin" activeMenuId="users" className="min-h-0" />
        </div>
      </div>
      <div className="flex h-full min-h-0 flex-col gap-2">
        <span className="text-body-sb-14 text-gray-400">SuperAdmin</span>
        <div className="min-h-0 w-64 flex-1">
          <Sidebar variant="superadmin" className="min-h-0" />
        </div>
      </div>
    </div>
  );
}

export const Gallery: Story = {
  render: renderGallery,
};

/** 활성 메뉴 상태를 관리하며 Sidebar variant의 선택 인터랙션을 렌더링합니다.
 * @returns 메뉴 선택이 가능한 관리자 사이드바
 */
function renderAdminVariant() {
  const [activeMenuId, setActiveMenuId] = useState('users');

  /** 선택한 메뉴 ID로 활성 상태를 갱신합니다.
   * @param menuId 활성화할 메뉴 식별자
   */
  function handleSelectMenu(menuId: string) {
    setActiveMenuId(menuId);
  }

  return (
    <div className="h-screen bg-gray-900 p-8">
      <Sidebar
        variant="admin"
        activeMenuId={activeMenuId}
        onSelectMenu={handleSelectMenu}
        className="min-h-0"
      />
    </div>
  );
}

export const Admin: Story = {
  args: {
    variant: 'admin',
  },
  render: renderAdminVariant,
};

export const SuperAdmin: Story = {
  args: {
    variant: 'superadmin',
  },
};
