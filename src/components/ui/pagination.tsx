'use client';

import type { HTMLAttributes } from 'react';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  /** 전체 페이지 수 */
  pageCount: number;
  /** 현재 페이지 번호 */
  page: number;
  /** 페이지 변경 시 호출됩니다. */
  onPageChange: (page: number) => void;
}

/** 페이지 이동 버튼과 현재 페이지 상태를 표시하는 페이지네이션입니다. */
export function Pagination({
  pageCount,
  page,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const visibleCount = Math.min(Math.max(pageCount, 0), 3);
  const startPage = Math.max(1, Math.min(page - 1, pageCount - visibleCount + 1));

  /** 표시할 페이지 번호를 계산합니다.
   * @param _ 사용하지 않는 배열 요소
   * @param index 표시 순서
   * @returns 페이지 번호
   */
  function getPageNumber(_: unknown, index: number) {
    return startPage + index;
  }
  const pages = Array.from({ length: visibleCount }, getPageNumber);

  /** 이전 페이지로 이동합니다. */
  function handlePrevious() {
    onPageChange(Math.max(page - 1, 1));
  }

  /** 다음 페이지로 이동합니다. */
  function handleNext() {
    onPageChange(Math.min(page + 1, pageCount));
  }

  /** 페이지 번호 버튼을 렌더링합니다.
   * @param pageNumber 표시할 페이지 번호
   * @returns 페이지 이동 버튼
   */
  function renderPage(pageNumber: number) {
    /** 선택한 페이지를 전달합니다. */
    function handleSelect() {
      onPageChange(pageNumber);
    }
    return (
      <button
        key={pageNumber}
        type="button"
        aria-label={`${pageNumber}페이지`}
        aria-current={pageNumber === page ? 'page' : undefined}
        onClick={handleSelect}
        className={cn(
          'flex size-6 items-center justify-center px-1 font-sans text-body-m-16',
          pageNumber === page ? (page === 1 ? 'text-gray-50' : 'text-gray-100') : 'text-gray-300',
        )}
      >
        {pageNumber}
      </button>
    );
  }

  return (
    <nav aria-label="페이지 탐색" className={cn('flex items-center gap-2', className)} {...props}>
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={handlePrevious}
        className="flex size-6 items-center justify-center"
      >
        <Icon name="chevron-left" size={24} />
      </button>
      {pages.map(renderPage)}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page >= pageCount}
        onClick={handleNext}
        className="flex size-6 items-center justify-center"
      >
        <Icon name="chevron-right" size={24} />
      </button>
    </nav>
  );
}
