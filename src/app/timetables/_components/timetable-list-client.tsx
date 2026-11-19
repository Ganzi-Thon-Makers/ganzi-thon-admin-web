'use client';

import { useQuery } from '@tanstack/react-query';
import { io } from 'next/cache';
import Link from 'next/link';
import { use } from 'react';

import { Button } from '@/components/ui/button';

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
          <TimetableTable timetables={data ?? []} />
        )}
      </div>
    </div>
  );
}
