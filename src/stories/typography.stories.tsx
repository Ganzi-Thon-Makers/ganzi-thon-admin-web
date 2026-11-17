import type { Meta, StoryObj } from '@storybook/nextjs-vite';

interface TypographyToken {
  name: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
  className: string;
}

const DISPLAY_TOKENS: TypographyToken[] = [
  {
    name: 'display_sb_36',
    size: '36px',
    weight: 'SemiBold',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-display-sb-36',
  },
  {
    name: 'display_sb_32',
    size: '32px',
    weight: 'SemiBold',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-display-sb-32',
  },
  {
    name: 'display_sb_28',
    size: '28px',
    weight: 'SemiBold',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-display-sb-28',
  },
];

const TITLE_TOKENS: TypographyToken[] = [
  {
    name: 'title_sb_24',
    size: '24px',
    weight: 'SemiBold',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-sb-24',
  },
  {
    name: 'title_m_24',
    size: '24px',
    weight: 'Medium',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-m-24',
  },
  {
    name: 'title_sb_20',
    size: '20px',
    weight: 'SemiBold',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-sb-20',
  },
  {
    name: 'title_m_20',
    size: '20px',
    weight: 'Medium',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-m-20',
  },
  {
    name: 'title_r_20',
    size: '20px',
    weight: 'Regular',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-r-20',
  },
  {
    name: 'title_sb_18',
    size: '18px',
    weight: 'SemiBold',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-sb-18',
  },
  {
    name: 'title_m_18',
    size: '18px',
    weight: 'Medium',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-m-18',
  },
  {
    name: 'title_r_18',
    size: '18px',
    weight: 'Regular',
    lineHeight: '130%',
    letterSpacing: '-1%',
    className: 'text-title-r-18',
  },
];

const BODY_TOKENS: TypographyToken[] = [
  {
    name: 'body_sb_16',
    size: '16px',
    weight: 'SemiBold',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-body-sb-16',
  },
  {
    name: 'body_m_16',
    size: '16px',
    weight: 'Medium',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-body-m-16',
  },
  {
    name: 'body_r_16',
    size: '16px',
    weight: 'Regular',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-body-r-16',
  },
  {
    name: 'body_sb_14',
    size: '14px',
    weight: 'SemiBold',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-body-sb-14',
  },
  {
    name: 'body_m_14',
    size: '14px',
    weight: 'Medium',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-body-m-14',
  },
  {
    name: 'body_r_14',
    size: '14px',
    weight: 'Regular',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-body-r-14',
  },
];

const CAPTION_TOKENS: TypographyToken[] = [
  {
    name: 'caption_sb_12',
    size: '12px',
    weight: 'SemiBold',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-caption-sb-12',
  },
  {
    name: 'caption_m_12',
    size: '12px',
    weight: 'Medium',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-caption-m-12',
  },
  {
    name: 'caption_r_12',
    size: '12px',
    weight: 'Regular',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-caption-r-12',
  },
  {
    name: 'caption_m_10',
    size: '10px',
    weight: 'Medium',
    lineHeight: '150%',
    letterSpacing: '-1%',
    className: 'text-caption-m-10',
  },
];

interface TypographySectionProps {
  title: string;
  tokens: TypographyToken[];
}

/**
 * 개별 타이포그래피 카테고리 섹션을 렌더링하는 컴포넌트입니다.
 */
function TypographySection({ title, tokens }: TypographySectionProps) {
  return (
    <section className="flex flex-col gap-4 border-b border-gray-800 pb-8 last:border-b-0">
      <h3 className="text-title-sb-20 text-gray-300">{title}</h3>
      <div className="flex flex-col divide-y divide-gray-800">
        {tokens.map(renderTypographyItem)}
      </div>
    </section>
  );
}

/**
 * 단일 타이포그래피 토큰 행을 렌더링한다.
 * @param token 타이포그래피 토큰 객체
 * @returns 타이포그래피 속성 정보와 미리보기 텍스트가 포함된 JSX 엘리먼트
 */
function renderTypographyItem(token: TypographyToken) {
  return (
    <div
      key={token.name}
      className="flex flex-col gap-2 py-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex w-80 shrink-0 flex-col gap-1">
        <span className="text-body-sb-14 text-white">{token.name}</span>
        <span className="text-caption-r-12 text-gray-400">
          {token.size} / {token.weight} / LH {token.lineHeight} / LS {token.letterSpacing}
        </span>
      </div>
      <p className={`${token.className} flex-1 text-white`}>다람쥐 헌 쳇바퀴에 타고파 123</p>
    </div>
  );
}

const meta = {
  title: '파운데이션/타이포그래피',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * 디자인 규격에 정의된 타이포그래피 토큰을 보여주는 갤러리 스토리를 렌더링한다.
 * @returns 카테고리별 타이포그래피 섹션 목록을 배치한 JSX 엘리먼트
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-8 bg-gray-900 p-8 text-white">
      <div className="flex flex-col gap-2 border-b border-gray-800 pb-4">
        <h2 className="text-title-sb-24 text-white">타이포그래피 시스템 (21종)</h2>
        <p className="text-body-r-14 text-gray-400">Pretendard 글꼴 기반 디자인 토큰 규격</p>
      </div>

      <TypographySection title="Display (3종)" tokens={DISPLAY_TOKENS} />
      <TypographySection title="Title (8종)" tokens={TITLE_TOKENS} />
      <TypographySection title="Body (6종)" tokens={BODY_TOKENS} />
      <TypographySection title="Caption (4종)" tokens={CAPTION_TOKENS} />
    </div>
  );
}

export const Gallery: Story = {
  name: '기본 갤러리',
  render: renderGallery,
};
