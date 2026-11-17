import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ImageThumbnail } from '@/components/ui/image-thumbnail';

const meta = { title: 'Components/ImageThumbnail', component: ImageThumbnail } satisfies Meta<
  typeof ImageThumbnail
>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 정의된 컴포넌트 상태를 표시합니다.
 * @returns 상태 갤러리
 */
function renderGallery() {
  return (
    <div className="flex flex-wrap gap-6 bg-gray-900 p-8">
      <ImageThumbnail state="Default" />
      <ImageThumbnail state="Empty" />
      <ImageThumbnail state="Editing" />
    </div>
  );
}

export const Gallery: Story = { render: renderGallery };

export const Default: Story = { args: { state: 'Default' } };

export const Empty: Story = { args: { state: 'Empty', className: 'bg-[#2C2E2C]' } };

export const Editing: Story = { args: { state: 'Editing' } };
