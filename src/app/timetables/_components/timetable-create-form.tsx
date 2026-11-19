'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';

import type { TimetableItem } from '../_data/timetable-api';
import { queryTimetables } from './timetable-list-client';
import { formatTimetableTime } from './timetable-table';

export interface TimetableCreateFormProps {
  /** 중복 시간 검사를 위한 초기 일정 목록 */
  initialTimetables?: TimetableItem[];
}

/** 시간 선택 드롭다운 컴포넌트의 Props */
interface TimetableTimeDropdownProps {
  /** 입력 필드 라벨 */
  label: string;
  /** 미선택 시 표시할 대체 문구 */
  placeholder: string;
  /** 현재 선택된 HH:mm 시각 */
  value: string;
  /** 시각 선택 변경 콜백 함수 */
  onChange: (value: string) => void;
  /** 입력 비활성화 여부 */
  disabled: boolean;
}

/**
 * 30분 간격의 시각 선택값을 만든다.
 * @param _value 사용하지 않는 배열 값
 * @param index 시각 순번
 * @returns HH:mm 시각
 */
function createTimeOption(_value: unknown, index: number): string {
  return `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`;
}
/** 선택 가능한 30분 단위 시각 목록 */
const timeOptions = Array.from({ length: 48 }, createTimeOption);

/**
 * 30분 단위로 시각을 선택할 수 있는 드롭다운 컴포넌트입니다.
 *
 * shadcn Select로 목록을 띄워 키보드 또는 마우스로 시각을 선택합니다.
 * @param props 라벨 / 플레이스홀더 / 선택 시각 / 변경 핸들러 / 비활성화 여부
 */
function TimetableTimeDropdown({
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: TimetableTimeDropdownProps) {
  const id = useId();

  /**
   * 선택한 시간을 상위로 전달한다.
   * @param time 선택된 HH:mm 시각
   */
  function handleValueChange(time: string | null) {
    if (time) onChange(time);
  }
  /**
   * 선택값이 없으면 플레이스홀더를 표시한다.
   * @param time 선택된 시각
   * @returns 표시할 문구
   */
  function renderValue(time: string | null) {
    return time ?? placeholder;
  }
  /**
   * 시간 선택 항목을 렌더링한다.
   * @param time 시각 선택값
   * @returns 시각 선택 항목
   */
  function renderTimeOption(time: string) {
    return (
      <SelectItem
        key={time}
        value={time}
        className="h-12 shrink-0 rounded-[4px] px-4 text-body-r-14 text-gray-50 focus:bg-gray-800 focus:text-gray-50"
      >
        {time}
      </SelectItem>
    );
  }
  return (
    <div className="min-w-0">
      <span id={`${id}-label`} className="mb-[10px] block text-body-r-14 text-gray-200">
        {label}
      </span>
      <Select<string>
        value={value || null}
        onValueChange={handleValueChange}
        disabled={disabled}
        modal={false}
      >
        <SelectTrigger
          aria-labelledby={`${id}-label`}
          className="h-12 w-full cursor-pointer rounded-[4px] border-0 bg-gray-900 px-4 text-body-r-14 text-gray-50 data-placeholder:text-gray-500 data-[size=default]:h-12"
        >
          <SelectValue>{renderValue}</SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="max-h-60 rounded-[4px] bg-gray-900 p-1 text-gray-50 ring-gray-700"
        >
          {timeOptions.map(renderTimeOption)}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * 시각을 자정부터 지난 분으로 변환한다.
 * @param time HH:mm 또는 API 일시
 * @returns 분 단위 시각
 */
function toMinutes(time: string): number {
  const [hours, minutes] = formatTimetableTime(time).split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 한국 시각 기준으로 등록된 일정과 겹치는지 검사한다.
 * @param startTime 등록 시작 시각
 * @param endTime 등록 종료 시각
 * @param timetables 등록된 일정 목록
 * @returns 겹치는 일정 존재 여부
 */
function overlapsTimetables(
  startTime: string,
  endTime: string,
  timetables: TimetableItem[],
): boolean {
  for (const item of timetables) {
    if (
      toMinutes(startTime) < toMinutes(item.endTime) &&
      toMinutes(endTime) > toMinutes(item.startTime)
    )
      return true;
  }
  return false;
}

/**
 * 타임테이블 일정을 새로 등록하는 입력 폼 컴포넌트입니다.
 *
 * 행사일(2026-11-21) 기준의 시작/종료 시각, 제목, 상세 내용을 검증하고 서버에 등록합니다.
 * @param props 중복 검사에 사용할 초기 일정 목록
 */
export function TimetableCreateForm({ initialTimetables }: TimetableCreateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: timetables } = useQuery({
    queryKey: ['timetables'],
    queryFn: queryTimetables,
    initialData: initialTimetables,
    staleTime: 30_000,
    retry: false,
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  /**
   * 시작 시간 선택을 반영한다.
   * @param value 선택한 HH:mm 시각
   */
  function handleStartTimeChange(value: string) {
    setStartTime(value);
  }
  /**
   * 종료 시간 선택을 반영한다.
   * @param value 선택한 HH:mm 시각
   */
  function handleEndTimeChange(value: string) {
    setEndTime(value);
  }
  /**
   * 제목 입력을 반영한다.
   * @param event 입력 변경 이벤트
   */
  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }
  /**
   * 상세 내용 입력을 반영한다.
   * @param event 입력 변경 이벤트
   */
  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }
  /**
   * 입력을 취소하고 타임테이블 목록 화면으로 이동한다.
   */
  function handleCancel() {
    router.push('/timetables');
  }
  /**
   * 입력과 시간 중복을 검증하고 행사 날짜의 한국 시각으로 등록한다.
   * @param event 폼 제출 이벤트
   * @returns 등록 요청 완료
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setErrorMessage('');
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 모두 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('일정 제목을 입력해주세요.');
      return;
    }
    if (title.trim().length > 100) {
      setErrorMessage('일정 제목은 100자 이하로 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('상세 내용을 입력해주세요.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMessage('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    if (timetables !== undefined && overlapsTimetables(startTime, endTime, timetables)) {
      setErrorMessage('기존 일정과 시간이 겹칩니다.');
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: `2026-11-21T${startTime}:00`,
          endTime: `2026-11-21T${endTime}:00`,
          title: title.trim(),
          description: description.trim(),
          isVote: false,
        }),
      });
      if (!response.ok) {
        let message = '일정을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.';
        try {
          const payload: unknown = await response.json();
          if (
            payload &&
            typeof payload === 'object' &&
            'message' in payload &&
            typeof payload.message === 'string'
          )
            message = payload.message || message;
        } catch {
          // JSON 본문이 없는 오류는 기본 메시지로 표시한다.
        }
        setErrorMessage(message);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['timetables'] });
      router.push('/timetables');
      router.refresh();
    } catch {
      setErrorMessage('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <section
        aria-labelledby="timetable-information-heading"
        className="rounded-[12px] bg-gray-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:p-8"
      >
        <h2 id="timetable-information-heading" className="mb-6 text-display-sb-28 text-gray-50">
          일정 정보
        </h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
          <TimetableTimeDropdown
            label="시작 시간 *"
            placeholder="14:00"
            value={startTime}
            onChange={handleStartTimeChange}
            disabled={isSubmitting}
          />
          <TimetableTimeDropdown
            label="종료 시간 *"
            placeholder="16:00"
            value={endTime}
            onChange={handleEndTimeChange}
            disabled={isSubmitting}
          />
        </div>
        <div className="mt-6">
          <TextField
            label="제목 *"
            placeholder="VOTE"
            required
            maxLength={100}
            value={title}
            onChange={handleTitleChange}
            disabled={isSubmitting}
            containerClassName="w-full gap-[10px]"
            inputWrapperClassName="h-12 rounded-[4px] bg-gray-900 text-gray-50"
          />
        </div>
        <div className="mt-6">
          <TextField
            label="상세 내용 *"
            required
            placeholder="마음에 드는 프로젝트에 투표해주세요."
            value={description}
            onChange={handleDescriptionChange}
            disabled={isSubmitting}
            containerClassName="w-full gap-[10px]"
            inputWrapperClassName="h-12 rounded-[4px] bg-gray-900 text-gray-50"
          />
        </div>
      </section>
      {errorMessage ? (
        <p role="alert" className="mt-4 text-body-r-14 text-red-400">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-7 flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={isSubmitting}
          onClick={handleCancel}
          className="h-12 w-34 rounded-[4px]"
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={isSubmitting}
          className="h-12 w-34 rounded-[4px]"
        >
          {isSubmitting ? '등록 중...' : '일정 등록'}
        </Button>
      </div>
    </form>
  );
}
