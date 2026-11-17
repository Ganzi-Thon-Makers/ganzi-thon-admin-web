import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components/ui/badge';

const meta = {
  title: '컴포넌트/뱃지',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 디자인 규격에 정의된 조합을 표시하는 Badge 갤러리 스토리를 렌더링한다.
 * @returns 뱃지 크기 및 변형별 컴포넌트 목록을 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-8 bg-gray-900 p-8 text-white">
      {/* Medium (3종) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">Medium</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Red</span>
            <Badge color="red" size="medium" variant="primary">
              WEB
            </Badge>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary / None</span>
            <Badge color="none" size="medium" variant="secondary">
              WEB
            </Badge>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Ivory</span>
            <Badge color="ivory" size="medium" variant="primary">
              APP
            </Badge>
          </div>
        </div>
      </section>

      {/* Small (3종) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">Small</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Red</span>
            <Badge color="red" size="small" variant="primary">
              APP
            </Badge>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary / None</span>
            <Badge color="none" size="small" variant="secondary">
              APP
            </Badge>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Primary / Ivory</span>
            <Badge color="ivory" size="small" variant="primary">
              APP
            </Badge>
          </div>
        </div>
      </section>

      {/* Xsmall (1종) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sb-16 text-gray-300">Xsmall</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start gap-2">
            <span className="text-caption-r-12 text-gray-400">Secondary / None</span>
            <Badge color="none" size="xsmall" variant="secondary">
              APP
            </Badge>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Gallery: Story = {
  name: '기본 갤러리',
  render: renderGallery,
};
