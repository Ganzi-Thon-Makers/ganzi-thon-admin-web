import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon, type IconName } from '@/components/ui/icon';

/**
 * 단일 아이콘 항목을 렌더링한다.
 * @param item 아이콘 이름 및 크기 설정 객체
 * @returns 아이콘 및 크기 레이블이 포함된 JSX 엘리먼트
 */
function renderIconItemItem(item: IconItemConfig) {
  return (
    <div key={item.name} className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="flex size-10 items-center justify-center">
        <Icon name={item.name} size={item.size} label={item.name} />
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-caption-sb-12 text-gray-200">{item.name}</span>
        <span className="text-caption-m-10 text-gray-400">{item.size}px</span>
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

interface IconItemConfig {
  name: IconName;
  size: 24 | 28;
}

const ICON_ITEMS: IconItemConfig[] = [
  { name: 'default', size: 24 },
  { name: 'success', size: 24 },
  { name: 'error', size: 24 },
  { name: 'chevron-down', size: 24 },
  { name: 'chevron-up', size: 24 },
  { name: 'chevron-left', size: 24 },
  { name: 'chevron-right', size: 24 },
  { name: 'delete', size: 24 },
  { name: 'dot-horizontal', size: 24 },
  { name: 'camera', size: 24 },
  { name: 'house', size: 28 },
  { name: 'card', size: 28 },
  { name: 'stamp', size: 28 },
  { name: 'cock', size: 28 },
  { name: 'user', size: 28 },
  { name: 'qr', size: 24 },
  { name: 'up', size: 24 },
  { name: 'search', size: 24 },
];

/**
 * 디자인 규격에 정의된 공용 아이콘 목록을 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 전체 아이콘 목록을 그리드로 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-6 bg-gray-900 p-8 text-white">
      <h3 className="text-body-sb-16 text-gray-300">Icon List (18)</h3>
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
        {ICON_ITEMS.map(renderIconItemItem)}
      </div>
    </div>
  );
}

export const Gallery: Story = {
  render: renderGallery,
};

export const Default: Story = { args: { ...ICON_ITEMS[0], label: ICON_ITEMS[0].name } };
export const Success: Story = { args: { ...ICON_ITEMS[1], label: ICON_ITEMS[1].name } };
export const Error: Story = { args: { ...ICON_ITEMS[2], label: ICON_ITEMS[2].name } };
export const ChevronDown: Story = { args: { ...ICON_ITEMS[3], label: ICON_ITEMS[3].name } };
export const ChevronUp: Story = { args: { ...ICON_ITEMS[4], label: ICON_ITEMS[4].name } };
export const ChevronLeft: Story = { args: { ...ICON_ITEMS[5], label: ICON_ITEMS[5].name } };
export const ChevronRight: Story = { args: { ...ICON_ITEMS[6], label: ICON_ITEMS[6].name } };
export const Delete: Story = { args: { ...ICON_ITEMS[7], label: ICON_ITEMS[7].name } };
export const DotHorizontal: Story = { args: { ...ICON_ITEMS[8], label: ICON_ITEMS[8].name } };
export const Camera: Story = { args: { ...ICON_ITEMS[9], label: ICON_ITEMS[9].name } };
export const House: Story = { args: { ...ICON_ITEMS[10], label: ICON_ITEMS[10].name } };
export const Card: Story = { args: { ...ICON_ITEMS[11], label: ICON_ITEMS[11].name } };
export const Stamp: Story = { args: { ...ICON_ITEMS[12], label: ICON_ITEMS[12].name } };
export const Cock: Story = { args: { ...ICON_ITEMS[13], label: ICON_ITEMS[13].name } };
export const User: Story = { args: { ...ICON_ITEMS[14], label: ICON_ITEMS[14].name } };
export const Qr: Story = { args: { ...ICON_ITEMS[15], label: ICON_ITEMS[15].name } };
export const Up: Story = { args: { ...ICON_ITEMS[16], label: ICON_ITEMS[16].name } };
export const Search: Story = { args: { ...ICON_ITEMS[17], label: ICON_ITEMS[17].name } };
