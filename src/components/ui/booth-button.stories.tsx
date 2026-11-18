import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BoothButton } from '@/components/ui/booth-button';

const meta = {
  title: 'Components/BoothButton',
  component: BoothButton,
  args: { children: '서비스 이름' },
} satisfies Meta<typeof BoothButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 정의된 컴포넌트 상태를 표시합니다.
 * @returns 상태 갤러리
 */
function renderGallery() {
  return (
    <div className="flex flex-wrap gap-6 bg-gray-900 p-8">
      <BoothButton state="default">서비스 이름</BoothButton>
      <BoothButton state="pressed">서비스 이름</BoothButton>
    </div>
  );
}

export const Gallery: Story = { render: renderGallery };

export const Default: Story = {
  args: { state: 'default' },
};

export const Pressed: Story = {
  args: { state: 'pressed' },
};
