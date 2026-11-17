import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 디자인 규격에 정의된 크기 및 상태별 버튼 변형을 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 크기 및 상태별 버튼 목록을 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-10 bg-gray-900 p-8 text-white">
      {/* Large (320px) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">Large (320px)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary</span>
            <Button variant="primary" size="large">
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Disabled</span>
            <Button variant="primary" size="large" disabled>
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary</span>
            <Button variant="secondary" size="large">
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary / Disabled</span>
            <Button variant="secondary" size="large" disabled>
              투표하기
            </Button>
          </div>
        </div>
      </section>

      {/* Medium (280px) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">Medium (280px)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary</span>
            <Button variant="primary" size="medium">
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Disabled</span>
            <Button variant="primary" size="medium" disabled>
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary</span>
            <Button variant="secondary" size="medium">
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary / Disabled</span>
            <Button variant="secondary" size="medium" disabled>
              투표하기
            </Button>
          </div>
        </div>
      </section>

      {/* Small (136px) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">Small (136px)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary</span>
            <Button variant="primary" size="small">
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Disabled</span>
            <Button variant="primary" size="small" disabled>
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary</span>
            <Button variant="secondary" size="small">
              투표하기
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary / Disabled</span>
            <Button variant="secondary" size="small" disabled>
              투표하기
            </Button>
          </div>
        </div>
      </section>

      {/* XS (Edit) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">XS</h3>
        <div className="flex gap-6">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary</span>
            <Button variant="primary" size="xs">
              수정
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary</span>
            <Button variant="secondary" size="xs">
              수정
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Gallery: Story = {
  render: renderGallery,
};

export const PrimaryLarge: Story = {
  args: { children: '투표하기', variant: 'primary', size: 'large' },
};

export const PrimaryLargeDisabled: Story = {
  args: { children: '투표하기', variant: 'primary', size: 'large', disabled: true },
};

export const SecondaryLarge: Story = {
  args: { children: '투표하기', variant: 'secondary', size: 'large' },
};

export const SecondaryLargeDisabled: Story = {
  args: { children: '투표하기', variant: 'secondary', size: 'large', disabled: true },
};

export const PrimaryMedium: Story = {
  args: { children: '투표하기', variant: 'primary', size: 'medium' },
};

export const PrimaryMediumDisabled: Story = {
  args: { children: '투표하기', variant: 'primary', size: 'medium', disabled: true },
};

export const SecondaryMedium: Story = {
  args: { children: '투표하기', variant: 'secondary', size: 'medium' },
};

export const SecondaryMediumDisabled: Story = {
  args: { children: '투표하기', variant: 'secondary', size: 'medium', disabled: true },
};

export const PrimarySmall: Story = {
  args: { children: '투표하기', variant: 'primary', size: 'small' },
};

export const PrimarySmallDisabled: Story = {
  args: { children: '투표하기', variant: 'primary', size: 'small', disabled: true },
};

export const SecondarySmall: Story = {
  args: { children: '투표하기', variant: 'secondary', size: 'small' },
};

export const SecondarySmallDisabled: Story = {
  args: { children: '투표하기', variant: 'secondary', size: 'small', disabled: true },
};

export const PrimaryXs: Story = {
  args: { children: '수정', variant: 'primary', size: 'xs' },
};

export const SecondaryXs: Story = {
  args: { children: '수정', variant: 'secondary', size: 'xs' },
};
