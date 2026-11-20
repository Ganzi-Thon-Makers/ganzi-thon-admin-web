'use client';

import Image from 'next/image';
import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export interface ImageThumbnailProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: 'Default' | 'Empty' | 'Editing';
  src?: string;
  alt?: string;
  /** 허용할 파일 확장자 및 MIME 타입 (기본값: 'image/*') */
  accept?: string;
  /** 사용자가 새 이미지 파일을 선택했을 때 호출되는 콜백 함수 */
  onImageChange?: (file: File) => void;
  /** 이미지 위에 표시할 문구 */
  displayLabel?: string;
}

export function ImageThumbnail({
  state = 'Default',
  src = '/images/thumbnail-example.png',
  alt = '대표 이미지',
  accept = 'image/*',
  onImageChange,
  displayLabel,
  className,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  ...props
}: ImageThumbnailProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevSrcRef = useRef(src);

  const empty = state === 'Empty';
  const editing = state === 'Editing';

  /**
   * 외부 src 변경 시 로컬 미리보기 상태를 초기화하는 부수 효과를 처리한다.
   */
  useEffect(
    function syncExternalSrc() {
      if (prevSrcRef.current !== src) {
        prevSrcRef.current = src;
        setPreviewUrl(null);
      }
    },
    [src],
  );

  /**
   * previewUrl 변경 또는 컴포넌트 언마운트 시 활성 blob URL을 해제하는 부수 효과를 처리한다.
   * @returns blob URL 리소스 정리 함수
   */
  useEffect(
    function handlePreviewCleanup() {
      /**
       * 현재 유지 중인 blob URL 리소스를 해제한다.
       */
      const cleanupObjectURL = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
      };

      return cleanupObjectURL;
    },
    [previewUrl],
  );

  /**
   * 썸네일 버튼 클릭 시 파일 선택 대화상자를 열고 상위의 onClick 핸들러를 호출한다.
   * @param event 버튼 클릭 이벤트 객체
   */
  const handleThumbnailClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && !disabled) {
      fileInputRef.current?.click();
    }
  };

  /**
   * 파일 선택 변경 시 로컬 미리보기 URL을 생성하고 부모 콜백으로 선택된 파일을 전달한다.
   * @param event 파일 입력 변경 이벤트 객체
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    onImageChange?.(file);
    event.target.value = '';
  };

  const currentSrc = previewUrl ?? (empty ? '' : src);
  const hasImage = Boolean(currentSrc);
  const showEmptyOverlay = empty && !previewUrl;
  const showEditingOverlay = editing;
  const defaultLabel = showEmptyOverlay ? '대표 이미지 등록' : '대표 이미지 수정';

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel ?? defaultLabel}
        disabled={disabled}
        onClick={handleThumbnailClick}
        className={cn(
          'relative flex h-[188px] w-[419px] max-w-full items-center justify-center overflow-hidden rounded-lg bg-gray-700',
          className,
        )}
        {...props}
      >
        {hasImage ? (
          <Image src={currentSrc} alt={alt} fill unoptimized className="object-cover" />
        ) : null}
        {showEmptyOverlay || showEditingOverlay ? (
          <span
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-2',
              showEditingOverlay && 'bg-static-black/90',
            )}
          >
            <Image
              src={showEmptyOverlay ? '/icons/ic-image-upload.svg' : '/icons/ic-pencil.svg'}
              alt=""
              width={showEmptyOverlay ? 36 : 42}
              height={showEmptyOverlay ? 36 : 42}
            />
            <span className="font-sans text-body-sb-16 text-white">
              {displayLabel ?? (showEmptyOverlay ? '대표 이미지 등록' : '대표 이미지 수정')}
            </span>
          </span>
        ) : null}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
