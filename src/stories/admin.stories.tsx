import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Admin } from '@/components/ui/admin';

const meta = {
  title: '컴포넌트/관리자 사이드바',
  component: Admin,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Admin>;

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
        <span className="text-body-sb-14 text-gray-400">일반 관리자 (Sidebar)</span>
        <div className="min-h-0 w-64 flex-1">
          <Admin variant="sidebar" activeMenuId="users" className="min-h-0" />
        </div>
      </div>
      <div className="flex h-full min-h-0 flex-col gap-2">
        <span className="text-body-sb-14 text-gray-400">최고 관리자 (Superadmin)</span>
        <div className="min-h-0 w-64 flex-1">
          <Admin variant="superadmin" className="min-h-0" />
        </div>
      </div>
    </div>
  );
}

export const Gallery: Story = {
  name: '기본 갤러리',
  render: renderGallery,
};
