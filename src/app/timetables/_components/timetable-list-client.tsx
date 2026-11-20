'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'next/cache';
import Link from 'next/link';
import { use, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

import type { TimetableItem } from '../_data/timetable-api';
import { TimetableTable } from './timetable-table';

export interface TimetableListClientProps {
  /** 서버에서 조회한 초기 일정 목록 (조회 실패 시 없음) */
  initialTimetables?: TimetableItem[];
  /** 서버 초기 조회 실패 시 표시할 오류 메시지 */
  initialErrorMessage?: string;
}

/**
 * 응답 본문을 JSON으로 읽고 실패하면 null을 반환한다.
 * @param response 내부 API 응답
 * @returns 파싱된 본문 또는 null
 */
async function parseJsonSafely(
  response: Response,
): Promise<{ data?: unknown; message?: string } | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * 인증된 내부 API에서 일정 목록을 조회한다.
 * @param context 쿼리 취소 신호를 담은 컨텍스트
 * @returns 시간 순서로 정렬된 일정 목록
 */
export async function queryTimetables({
  signal,
}: {
  signal: AbortSignal;
}): Promise<TimetableItem[]> {
  const response = await fetch('/api/timetables', { cache: 'no-store', signal });
  const payload = await parseJsonSafely(response);
  if (!response.ok) throw new Error(payload?.message || '타임테이블 목록을 불러오지 못했습니다.');
  if (!Array.isArray(payload?.data))
    throw new Error('타임테이블 목록 응답 형식이 올바르지 않습니다.');
  return payload.data as TimetableItem[];
}

/**
 * 타임테이블 목록 로딩 상태를 표시하는 컴포넌트입니다.
 */
export function TimetableListLoading() {
  return (
    <p role="status" aria-busy="true" className="text-body-r-16 text-gray-300">
      타임테이블 목록을 불러오는 중입니다...
    </p>
  );
}

/**
 * 타임테이블 목록 화면의 클라이언트 상호작용을 처리하는 컴포넌트입니다.
 *
 * 초기 서버 데이터를 바탕으로 목록을 표시하고, 필요한 경우 캐시 갱신과 재시도를 수행합니다.
 * @param props 초기 일정 목록 / 오류 메시지
 */
export function TimetableListClient({
  initialTimetables,
  initialErrorMessage,
}: TimetableListClientProps) {
  use(io());
  const queryClient = useQueryClient();
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const deletingIdsRef = useRef(new Set<number>());
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [pendingDeleteItem, setPendingDeleteItem] = useState<TimetableItem | null>(null);
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['timetables'],
    queryFn: queryTimetables,
    initialData: initialTimetables,
    enabled: initialTimetables !== undefined,
    staleTime: 30_000,
    retry: false,
  });
  const errorMessage = error?.message ?? (data === undefined ? initialErrorMessage : undefined);

  /**
   * 실패한 일정 조회를 다시 요청한다.
   */
  function handleRetry() {
    void refetch();
  }

  /**
   * 삭제 중이 아닌 일정이면 삭제 확인 모달을 연다.
   * @param item 삭제할 일정
   */
  function handleDeleteClick(item: TimetableItem) {
    if (deletingIdsRef.current.has(item.id)) return;
    setPendingDeleteItem(item);
  }

  /**
   * 삭제 확인 모달의 열림 상태를 갱신한다.
   * @param open 다음 열림 상태
   */
  function handleDeleteModalOpenChange(open: boolean) {
    if (!open) setPendingDeleteItem(null);
  }

  /**
   * 모달을 닫고 대기 중인 일정을 삭제한다.
   */
  function handleConfirmDelete() {
    const item = pendingDeleteItem;
    setPendingDeleteItem(null);
    if (item) void handleDeleteTimetable(item);
  }

  /**
   * 사용자 확인 후 일정을 삭제하고 목록 캐시와 요청 상태를 갱신한다.
   * @param item 삭제할 일정
   */
  async function handleDeleteTimetable(item: TimetableItem): Promise<void> {
    if (deletingIdsRef.current.has(item.id)) return;

    setDeleteErrorMessage('');
    deletingIdsRef.current.add(item.id);

    /**
     * 삭제 중 목록에 식별자를 추가한다.
     * @param currentIds 현재 삭제 중인 식별자 목록
     * @returns 식별자가 추가된 목록
     */
    function addDeletingId(currentIds: number[]): number[] {
      return currentIds.includes(item.id) ? currentIds : [...currentIds, item.id];
    }

    setDeletingIds(addDeletingId);
    try {
      const response = await fetch(`/api/timetables/${encodeURIComponent(String(item.id))}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const payload = await parseJsonSafely(response);
        setDeleteErrorMessage(
          payload?.message || '일정을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.',
        );
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['timetables'] });
    } catch {
      setDeleteErrorMessage('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      deletingIdsRef.current.delete(item.id);

      /**
       * 삭제 중 목록에서 식별자를 제거한다.
       * @param currentIds 현재 삭제 중인 식별자 목록
       * @returns 식별자가 제거된 목록
       */
      function removeDeletingId(currentIds: number[]): number[] {
        /**
         * 제거 대상 일정이 아닌 식별자인지 확인한다.
         * @param id 확인할 일정 식별자
         * @returns 유지 여부
         */
        function isNotDeletingId(id: number): boolean {
          return id !== item.id;
        }

        return currentIds.filter(isNotDeletingId);
      }

      setDeletingIds(removeDeletingId);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-end">
        <Button
          nativeButton={false}
          render={<Link href="/timetables/create" />}
          variant="primary"
          size="small"
          className="h-12 w-34 rounded-[4px] text-body-sb-16 text-static-white"
        >
          일정 등록
        </Button>
      </div>
      {deleteErrorMessage ? (
        <p role="alert" className="text-body-r-14 text-red-400">
          {deleteErrorMessage}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        {isFetching && data === undefined ? (
          <TimetableListLoading />
        ) : errorMessage ? (
          <div role="alert" className="flex flex-col items-start gap-4 py-8">
            <p className="text-body-r-16 text-red-400">{errorMessage}</p>
            <Button
              type="button"
              variant="secondary"
              size="small"
              disabled={isFetching}
              onClick={handleRetry}
            >
              다시 불러오기
            </Button>
          </div>
        ) : (
          <TimetableTable
            timetables={data ?? []}
            deletingIds={deletingIds}
            onDelete={handleDeleteClick}
          />
        )}
      </div>
      <Modal
        open={pendingDeleteItem !== null}
        onOpenChange={handleDeleteModalOpenChange}
        title="일정을 삭제할까요?"
        description="삭제 후 되돌릴 수 없습니다."
        cancelLabel="취소"
        confirmLabel="일정 삭제"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
