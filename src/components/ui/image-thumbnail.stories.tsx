import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ImageThumbnail } from '@/components/ui/image-thumbnail';

const meta = {
  title: 'Components/ImageThumbnail',
  component: ImageThumbnail,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onImageChange: { action: 'imageChanged' },
  },
} satisfies Meta<typeof ImageThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 디자인 규격에 정의된 상태별 ImageThumbnail 컴포넌트를 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 상태별 ImageThumbnail 목록을 배치한 JSX 엘리먼트
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

export const Gallery: Story = {
  render: renderGallery,
};

export const Default: Story = {
  args: {
    state: 'Default',
  },
};

export const Empty: Story = {
  args: {
    state: 'Empty',
  },
};

export const Editing: Story = {
  args: {
    state: 'Editing',
  },
};
