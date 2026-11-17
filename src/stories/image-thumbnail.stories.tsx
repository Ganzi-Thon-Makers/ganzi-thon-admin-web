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
      <ImageThumbnail state="Variant2" />
      <ImageThumbnail state="Variant3" />
    </div>
  );
}

export const Gallery: Story = { render: renderGallery };

export const Default: Story = { args: { state: 'Default' } };

export const Variant2: Story = { args: { state: 'Variant2', className: 'bg-[#2C2E2C]' } };

export const Variant3: Story = { args: { state: 'Variant3' } };
