'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import type { TimetableItem } from '../_data/timetable-api';

export interface TimetableTableProps {
  /** 시간 순서로 정렬된 일정 목록 */
  timetables: TimetableItem[];
  /** 삭제 중인 일정 식별자 목록 */
  deletingIds?: readonly number[];
  /** 일정 삭제 요청 핸들러 */
  onDelete?: (item: TimetableItem) => void;
}

interface TimetableRowProps {
  /** 표시할 일정 */
  item: TimetableItem;
  /** 삭제 중인 일정 식별자 목록 */
  deletingIds?: readonly number[];
  /** 일정 삭제 요청 핸들러 */
  onDelete?: (item: TimetableItem) => void;
}

/**
 * 일정 시간을 한국 표준시의 24시간 시각으로 변환한다.
 * @param value HH:mm / HH:mm:ss 또는 ISO 일시
 * @returns HH:mm 형식의 시각
 */
export function formatTimetableTime(value: string): string {
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) return value.slice(0, 5);
  if (!/(Z|[+-]\d{2}:?\d{2})$/.test(value)) return value.slice(11, 16);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

/**
 * 일정의 시작과 종료 시간을 연결한다.
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @returns 표시할 시간 범위
 */
export function formatTimetableTimeRange(startTime: string, endTime: string): string {
  return `${formatTimetableTime(startTime)} - ${formatTimetableTime(endTime)}`;
}

/**
 * 일정 한 행을 렌더링하고 수정 / 삭제 동작을 제공하는 컴포넌트입니다.
 * @param props 행 데이터와 수정 / 삭제 상태 및 핸들러
 */
function TimetableRow({ item, deletingIds, onDelete }: TimetableRowProps) {
  const router = useRouter();

  /**
   * 수정 버튼 클릭 시 일정 수정 화면으로 이동한다.
   */
  function handleEditClick() {
    router.push(`/timetables/${item.id}/edit`);
  }
  const isDeleting = deletingIds?.includes(item.id) ?? false;

  /**
   * 삭제 버튼 클릭 이벤트를 상위 목록 핸들러에 전달한다.
   */
  function handleDeleteClick() {
    onDelete?.(item);
  }

  return (
    <tr key={item.id} className="h-[72px] bg-gray-800">
      <td className="px-6 text-body-sb-16 text-gray-50">
        {formatTimetableTimeRange(item.startTime, item.endTime)}
      </td>
      <th
        scope="row"
        className="truncate px-6 text-left text-body-r-16 font-normal text-gray-100"
        title={item.title}
      >
        {item.title}
      </th>
      <td className="truncate px-6 text-body-r-16 text-gray-300" title={item.description}>
        {item.description}
      </td>
      <td className="px-6">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="secondary"
            size="xs"
            disabled={isDeleting}
            onClick={handleEditClick}
            className="h-6 w-[98px] px-0 py-0 text-caption-sb-12 disabled:opacity-60"
            aria-label={`${item.title} 수정`}
          >
            수정
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            disabled={!onDelete || isDeleting}
            aria-busy={isDeleting}
            className="h-6 w-[98px] px-0 py-0 text-caption-sb-12 disabled:opacity-60"
            aria-label={`${item.title} 삭제`}
            onClick={handleDeleteClick}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

/**
 * 타임테이블 일정 목록을 표 형태로 표시하는 컴포넌트입니다.
 * @param props 정렬된 일정 목록 / 삭제 상태 / 삭제 핸들러
 */
export function TimetableTable({ timetables, deletingIds, onDelete }: TimetableTableProps) {
  /**
   * 일정 정보를 바탕으로 테이블 행 요소를 렌더링한다.
   * @param item 표시할 일정
   * @returns 일정 테이블 행 요소
   */
  function renderTimetableRow(item: TimetableItem) {
    return <TimetableRow key={item.id} item={item} deletingIds={deletingIds} onDelete={onDelete} />;
  }

  return (
    <table className="w-full min-w-[960px] table-fixed text-left" aria-label="타임테이블 일정 목록">
      <colgroup>
        <col style={{ width: '22%' }} />
        <col style={{ width: '23%' }} />
        <col style={{ width: '37%' }} />
        <col style={{ width: '18%' }} />
      </colgroup>
      <thead className="h-14 bg-gray-700 text-body-m-16 text-gray-300">
        <tr>
          <th scope="col" className="px-6 font-medium">
            시간
          </th>
          <th scope="col" className="px-6 font-medium">
            일정
          </th>
          <th scope="col" className="px-6 font-medium">
            상세 내용
          </th>
          <th scope="col" className="px-6 font-medium">
            관리
          </th>
        </tr>
      </thead>
      <tbody>
        {timetables.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              role="status"
              className="h-56 bg-gray-800 text-center text-body-r-16 text-gray-300"
            >
              등록된 타임테이블 일정이 없습니다.
            </td>
          </tr>
        ) : (
          timetables.map(renderTimetableRow)
        )}
      </tbody>
    </table>
  );
}
