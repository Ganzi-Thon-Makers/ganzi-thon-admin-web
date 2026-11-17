import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 디자인 규격에 정의된 입력 상태별 텍스트 필드를 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 입력 상태별 TextField 컴포넌트 목록을 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-8 bg-gray-600 p-8 text-white">
      {/* Default 상태 (placeholder) */}
      <div className="flex flex-col gap-2">
        <span className="text-caption-r-12 text-gray-400">Default (기본 / Placeholder)</span>
        <TextField
          aria-label="default"
          visualState="default"
          placeholder="text"
          leadingIcon={<Icon name="default" />}
          trailingIcon={<Icon name="default" />}
        />
      </div>

      {/* Typed 상태 (입력 중) */}
      <div className="flex flex-col gap-2">
        <span className="text-caption-r-12 text-gray-400">Typed (입력 중)</span>
        <TextField
          aria-label="typed"
          visualState="typed"
          defaultValue="text"
          leadingIcon={<Icon name="default" />}
          trailingIcon={<Icon name="default" />}
        />
      </div>

      {/* Focused 상태 (포커스) */}
      <div className="flex flex-col gap-2">
        <span className="text-caption-r-12 text-gray-400">Focused (포커스 활성)</span>
        <TextField
          aria-label="focused"
          visualState="focused"
          defaultValue="text"
          leadingIcon={<Icon name="default" />}
          trailingIcon={<Icon name="default" />}
        />
      </div>

      {/* Error 상태 (오류 및 에러 메시지) */}
      <div className="flex flex-col gap-2">
        <span className="text-caption-r-12 text-gray-400">Error (오류 피드백)</span>
        <TextField
          aria-label="error"
          visualState="error"
          defaultValue="text"
          errorMessage="text"
          leadingIcon={<Icon name="default" />}
          trailingIcon={<Icon name="default" />}
        />
      </div>

      {/* Entered 상태 (입력 완료) */}
      <div className="flex flex-col gap-2">
        <span className="text-caption-r-12 text-gray-400">Entered (입력 완료)</span>
        <TextField
          aria-label="entered"
          visualState="entered"
          defaultValue="text"
          leadingIcon={<Icon name="default" />}
          trailingIcon={<Icon name="default" />}
        />
      </div>
    </div>
  );
}

export const Gallery: Story = {
  render: renderGallery,
};

export const Default: Story = {
  args: {
    'aria-label': 'default',
    visualState: 'default',
    placeholder: 'text',
    leadingIcon: <Icon name="default" />,
    trailingIcon: <Icon name="default" />,
  },
};

export const Typed: Story = {
  args: {
    'aria-label': 'typed',
    visualState: 'typed',
    defaultValue: 'text',
    leadingIcon: <Icon name="default" />,
    trailingIcon: <Icon name="default" />,
  },
};

export const Focused: Story = {
  args: {
    'aria-label': 'focused',
    visualState: 'focused',
    defaultValue: 'text',
    leadingIcon: <Icon name="default" />,
    trailingIcon: <Icon name="default" />,
  },
};

export const Error: Story = {
  args: {
    'aria-label': 'error',
    visualState: 'error',
    defaultValue: 'text',
    errorMessage: 'text',
    leadingIcon: <Icon name="default" />,
    trailingIcon: <Icon name="default" />,
  },
};

export const Entered: Story = {
  args: {
    'aria-label': 'entered',
    visualState: 'entered',
    defaultValue: 'text',
    leadingIcon: <Icon name="default" />,
    trailingIcon: <Icon name="default" />,
  },
};
