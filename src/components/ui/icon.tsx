import Image from 'next/image';

/**
 * 시스템에서 지원하는 아이콘 이름 유니온 타입
 */
export type IconName =
  | 'default'
  | 'success'
  | 'error'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'delete'
  | 'dot-horizontal'
  | 'camera'
  | 'house'
  | 'card'
  | 'stamp'
  | 'cock'
  | 'user'
  | 'qr'
  | 'up'
  | 'search';

type IconGeometry = 'full' | 'framed' | 'user' | 'search';

interface IconConfig {
  slotSize: 24 | 28;
  src?: string;
  width?: number;
  height?: number;
  geometry?: IconGeometry;
}

export interface IconProps {
  /** 렌더링할 아이콘 이름 (기본값: `'default'`) */
  name?: IconName;
  /** 아이콘 표시 크기 */
  size?: number;
  /** 추가 클래스명 */
  className?: string;
  /** 스크린 리더용 접근성 레이블 */
  label?: string;
}

/** 아이콘 이름별 SVG 파일 경로 및 렌더링 규격 설정 매핑 */
const iconMap: Record<IconName, IconConfig> = {
  default: { slotSize: 24 },
  success: {
    slotSize: 24,
    src: '/icons/ic-success.svg',
    width: 24,
    height: 24,
  },
  error: {
    slotSize: 24,
    src: '/icons/ic-error.svg',
    width: 24,
    height: 24,
  },
  'chevron-down': {
    slotSize: 24,
    src: '/icons/ic-chevron-down.svg',
    width: 24,
    height: 24,
  },
  'chevron-up': {
    slotSize: 24,
    src: '/icons/ic-chevron-up.svg',
    width: 24,
    height: 24,
  },
  'chevron-left': {
    slotSize: 24,
    src: '/icons/ic-chevron-left.svg',
    width: 24,
    height: 24,
  },
  'chevron-right': {
    slotSize: 24,
    src: '/icons/ic-chevron-right.svg',
    width: 24,
    height: 24,
  },
  delete: {
    slotSize: 24,
    src: '/icons/ic-delete.svg',
    width: 24,
    height: 24,
  },
  'dot-horizontal': {
    slotSize: 24,
    src: '/icons/ic-dot-horizontal.svg',
    width: 24,
    height: 24,
  },
  camera: {
    slotSize: 24,
    src: '/icons/ic-camera.svg',
    width: 24,
    height: 24,
  },
  house: {
    slotSize: 28,
    src: '/icons/ic-house.svg',
    width: 21.6,
    height: 21.6,
    geometry: 'framed',
  },
  card: {
    slotSize: 28,
    src: '/icons/ic-card.svg',
    width: 21.6,
    height: 21.6,
    geometry: 'framed',
  },
  stamp: {
    slotSize: 28,
    src: '/icons/ic-stamp.svg',
    width: 21.6,
    height: 21.6,
    geometry: 'framed',
  },
  cock: {
    slotSize: 28,
    src: '/icons/ic-cock.svg',
    width: 28,
    height: 28,
  },
  user: {
    slotSize: 28,
    src: '/icons/ic-user.svg',
    width: 18,
    height: 18,
    geometry: 'user',
  },
  qr: {
    slotSize: 24,
    src: '/icons/ic-qr.svg',
    width: 24,
    height: 24,
  },
  up: {
    slotSize: 24,
    src: '/icons/ic-up.svg',
    width: 24,
    height: 24,
  },
  search: {
    slotSize: 24,
    src: '/icons/ic-search.svg',
    width: 15.7687,
    height: 15.7687,
    geometry: 'search',
  },
};

/**
 * SVG 아이콘을 표시하고 크기와 접근성 레이블을 지원하는 공용 Icon 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Icon name="chevron-down" size={24} label="더 보기" />
 * ```
 */
export function Icon({ name = 'default', size, className, label }: IconProps) {
  const config = iconMap[name];
  const iconSize = size ?? config.slotSize;
  const isDefault = name === 'default';
  const image = config.src ? (
    <Image
      src={config.src}
      alt={label ?? ''}
      width={config.width ?? config.slotSize}
      height={config.height ?? config.slotSize}
      unoptimized
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  ) : null;

  return (
    <span
      aria-hidden={!label}
      aria-label={isDefault ? label : undefined}
      role={isDefault && label ? 'img' : undefined}
      className={className}
      style={{
        display: 'inline-block',
        position: 'relative',
        flexShrink: 0,
        width: iconSize,
        height: iconSize,
        overflow: name === 'up' || name === 'search' ? 'hidden' : undefined,
        backgroundColor: isDefault ? 'rgba(255, 71, 74, 0.12)' : undefined,
        border: isDefault ? '0.916px dashed #9747ff' : undefined,
        boxSizing: 'border-box',
      }}
    >
      {config.geometry === 'framed' ? (
        <span
          style={{
            position: 'absolute',
            inset: '11.4286%',
          }}
        >
          {image}
        </span>
      ) : config.geometry === 'user' ? (
        <span
          style={{
            position: 'absolute',
            top: '5.607%',
            right: '7.14%',
            left: '7.14%',
            aspectRatio: '1 / 1',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: '14.28% 12.5% 10.72%',
            }}
          >
            {image}
          </span>
        </span>
      ) : config.geometry === 'search' ? (
        <span
          style={{
            position: 'absolute',
            inset: '16.67% 17.63% 17.63% 16.67%',
          }}
        >
          {image}
        </span>
      ) : (
        image
      )}
    </span>
  );
}
