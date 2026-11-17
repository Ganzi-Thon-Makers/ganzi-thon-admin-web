import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Pagination } from '@/components/ui/pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { pageCount: 3, page: 1, onPageChange: handlePageChange },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 갤러리의 표시 상태를 유지합니다.
 * @param page 선택한 페이지 번호
 */
function handlePageChange(page: number) {
  void page;
}

/** 정의된 세 페이지 상태를 표시합니다.
 * @returns 페이지 상태 갤러리
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-6 bg-gray-900 p-8">
      <Pagination page={1} pageCount={3} onPageChange={handlePageChange} />
      <Pagination page={2} pageCount={3} onPageChange={handlePageChange} />
      <Pagination page={3} pageCount={3} onPageChange={handlePageChange} />
    </div>
  );
}

export const Gallery: Story = { render: renderGallery };

export const Page1: Story = {
  name: '1 page',
  args: { page: 1 },
};

export const Page2: Story = {
  name: '2 page',
  args: { page: 2 },
};

export const Page3: Story = {
  name: '3 page',
  args: { page: 3 },
};
