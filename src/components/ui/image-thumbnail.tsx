import Image from 'next/image';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ImageThumbnailProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: 'Default' | 'Empty' | 'Editing';
  src?: string;
  alt?: string;
}

export function ImageThumbnail({
  state = 'Default',
  src = '/images/thumbnail-example.png',
  alt = '대표 이미지',
  className,
  ...props
}: ImageThumbnailProps) {
  const empty = state === 'Empty';
  const editing = state === 'Editing';

  return (
    <button
      type="button"
      aria-label={empty ? '대표 이미지 등록' : '대표 이미지 수정'}
      className={cn(
        'relative flex h-[188px] w-[419px] max-w-full items-center justify-center overflow-hidden rounded-lg bg-gray-700',
        className,
      )}
      {...props}
    >
      {!empty ? <Image src={src} alt={alt} fill unoptimized className="object-cover" /> : null}
      {empty || editing ? (
        <span
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-2',
            editing && 'bg-[#090a0a]/90',
          )}
        >
          <Image
            src={empty ? '/icons/ic-image-upload.svg' : '/icons/ic-pencil.svg'}
            alt=""
            width={empty ? 36 : 42}
            height={empty ? 36 : 42}
          />
          <span className="font-sans text-body-sb-16 text-white">
            {empty ? '대표 이미지 등록' : '대표 이미지 수정'}
          </span>
        </span>
      ) : null}
    </button>
  );
}
