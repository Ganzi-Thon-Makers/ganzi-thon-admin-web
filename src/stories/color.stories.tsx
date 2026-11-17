import type { Meta, StoryObj } from '@storybook/nextjs-vite';

interface ColorToken {
  name: string;
  hex: string;
  className: string;
  note?: string;
  border?: boolean;
}

const RED_COLORS: ColorToken[] = [
  { name: 'red100', hex: '#FFEDEA', className: 'bg-red-100' },
  { name: 'red200', hex: '#FFCDC6', className: 'bg-red-200' },
  { name: 'red300', hex: '#FF9B8E', className: 'bg-red-300' },
  { name: 'red400', hex: '#FF5D50', className: 'bg-red-400' },
  { name: 'red500', hex: '#FF1627', className: 'bg-red-500', note: 'Main' },
  { name: 'red600', hex: '#D1000D', className: 'bg-red-600' },
  { name: 'red700', hex: '#A80008', className: 'bg-red-700' },
  { name: 'red800', hex: '#7D0004', className: 'bg-red-800' },
  { name: 'red900', hex: '#540002', className: 'bg-red-900' },
];

const STATIC_COLORS: ColorToken[] = [
  { name: 'white', hex: '#FFFFFF', className: 'bg-static-white', border: true },
  { name: 'black', hex: '#090A0A', className: 'bg-static-black' },
];

const OPACITY_COLORS: ColorToken[] = [
  { name: 'black90', hex: '#090A0A 90%', className: 'bg-opacity-black-90' },
];

const IVORY_COLORS: ColorToken[] = [
  { name: 'ivory100', hex: '#FCF8F4', className: 'bg-ivory-100', border: true },
  { name: 'ivory200', hex: '#FBEEE1', className: 'bg-ivory-200' },
];

const GRAY_COLORS: ColorToken[] = [
  { name: 'gray50', hex: '#F9FAF9', className: 'bg-gray-50', border: true },
  { name: 'gray100', hex: '#F1F2F1', className: 'bg-gray-100' },
  { name: 'gray200', hex: '#DADBDA', className: 'bg-gray-200' },
  { name: 'gray300', hex: '#B3B4B3', className: 'bg-gray-300' },
  { name: 'gray400', hex: '#7C7D7C', className: 'bg-gray-400' },
  { name: 'gray500', hex: '#5B5B5B', className: 'bg-gray-500' },
  { name: 'gray600', hex: '#3C3D3C', className: 'bg-gray-600' },
  { name: 'gray700', hex: '#2C2E2C', className: 'bg-gray-700' },
  { name: 'gray800', hex: '#131413', className: 'bg-gray-800' },
  { name: 'gray900', hex: '#0B0B0B', className: 'bg-gray-900' },
];

interface ColorSectionProps {
  title: string;
  colors: ColorToken[];
}

/**
 * 개별 색상 팔레트 섹션을 렌더링하는 컴포넌트입니다.
 */
function ColorSection({ title, colors }: ColorSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-title-sb-20 text-gray-300">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
        {colors.map(renderColorItem)}
      </div>
    </section>
  );
}

/**
 * 단일 색상 토큰 카드를 렌더링한다.
 * @param color 렌더링할 색상 토큰 객체
 * @returns 색상 스와치와 정보가 포함된 JSX 엘리먼트
 */
function renderColorItem(color: ColorToken) {
  return (
    <div key={color.name} className="flex flex-col gap-2">
      <div
        className={`relative h-24 w-full rounded-lg ${color.className} ${
          color.border ? 'border border-gray-700' : ''
        }`}
      >
        {color.note ? (
          <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-caption-m-10 text-white">
            {color.note}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col">
        <span className="text-body-sb-14 text-white">{color.name}</span>
        <span className="text-caption-r-12 text-gray-400">{color.hex}</span>
      </div>
    </div>
  );
}

const meta = {
  title: '파운데이션/컬러',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * 디자인 시스템의 컬러 팔레트 토큰을 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 팔레트별 색상 섹션 목록을 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-10 bg-gray-900 p-8 text-white">
      <div className="flex flex-col gap-2 border-b border-gray-800 pb-4">
        <h2 className="text-title-sb-24 text-white">컬러 시스템</h2>
        <p className="text-body-r-14 text-gray-400">컬러 토큰별 색상값</p>
      </div>

      <ColorSection title="Red (9종)" colors={RED_COLORS} />
      <ColorSection title="Static (2종)" colors={STATIC_COLORS} />
      <ColorSection title="Opacity (1종)" colors={OPACITY_COLORS} />
      <ColorSection title="Ivory (2종)" colors={IVORY_COLORS} />
      <ColorSection title="Gray (10종)" colors={GRAY_COLORS} />
    </div>
  );
}

export const Gallery: Story = {
  name: '기본 갤러리',
  render: renderGallery,
};
