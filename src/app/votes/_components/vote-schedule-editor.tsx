'use client';

import { type ChangeEvent, useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';

import { controlVoteAction, type VoteControlState } from '../_actions/control-vote';
import { updateVoteTimeAction, type VoteTimeState } from '../_actions/update-vote-time';
import type { VoteSchedule } from '../_data/vote';

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const INITIAL_STATE: VoteTimeState = { status: 'idle', message: '' };
const fieldClassName =
  'h-[50px] w-full rounded bg-gray-900 px-5 py-3 text-title-m-20 text-gray-50 outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60';

interface VoteScheduleEditorProps {
  schedule: VoteSchedule;
}

interface VoteTimeFormProps extends VoteScheduleEditorProps {
  onCancel: () => void;
  onSaved: () => void;
}

function VoteTimeForm({ schedule, onCancel, onSaved }: VoteTimeFormProps) {
  const [startTime, setStartTime] = useState(timeFormatter.format(new Date(schedule.startTime)));
  const [endTime, setEndTime] = useState(timeFormatter.format(new Date(schedule.endTime)));

  /**
   * 시작 시각 입력 필드 변경 이벤트를 처리하고 상태를 갱신한다.
   * @param event 시작 시각 입력 필드 변경 이벤트 객체
   */
  function handleStartChange(event: ChangeEvent<HTMLInputElement>) {
    setStartTime(event.target.value);
  }

  /**
   * 마감 시각 입력 필드 변경 이벤트를 처리하고 상태를 갱신한다.
   * @param event 마감 시각 입력 필드 변경 이벤트 객체
   */
  function handleEndChange(event: ChangeEvent<HTMLInputElement>) {
    setEndTime(event.target.value);
  }

  /**
   * 먼저 입력한 시작 / 마감 시각 순서를 검증하고, 유효한 경우 서버 액션을 호출하며 성공하면 완료 콜백을 실행한다.
   * @param previousState 이전 저장 처리 상태
   * @param formData 시작 / 마감 시각 폼 데이터
   * @returns 시각 순서 검증 오류 / 서버 액션 결과 / 통신 오류 상태
   */
  async function handleSave(
    previousState: VoteTimeState,
    formData: FormData,
  ): Promise<VoteTimeState> {
    const nextStartTime = String(formData.get('startTime') ?? '');
    const nextEndTime = String(formData.get('endTime') ?? '');
    if (nextStartTime >= nextEndTime) {
      return {
        status: 'error',
        message: '시작 시간이 마감 시간보다 늦습니다. 시간을 다시 확인해주세요.',
      };
    }
    try {
      const result = await updateVoteTimeAction(previousState, formData);
      if (result.status === 'success') onSaved();
      return result;
    } catch {
      return { status: 'error', message: '저장하지 못했습니다. 잠시 후 다시 시도해주세요.' };
    }
  }

  const [state, formAction, isPending] = useActionState(handleSave, INITIAL_STATE);
  const isChanged =
    startTime !== timeFormatter.format(new Date(schedule.startTime)) ||
    endTime !== timeFormatter.format(new Date(schedule.endTime));

  return (
    <form action={formAction} aria-busy={isPending} data-vote-editing>
      <fieldset disabled={isPending} className="mt-4 grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-body-m-16 text-gray-300">
          <span className="block">시작 시간</span>
          <input
            type="text"
            name="startTime"
            pattern="([01]\d|2[0-3]):[0-5]\d"
            maxLength={5}
            placeholder="HH:mm"
            autoComplete="off"
            required
            value={startTime}
            onChange={handleStartChange}
            className={fieldClassName}
            aria-describedby={state.status === 'error' ? 'vote-time-error' : undefined}
          />
        </label>
        <label className="space-y-2 text-body-m-16 text-gray-300">
          <span className="block">마감 시간</span>
          <input
            type="text"
            name="endTime"
            pattern="([01]\d|2[0-3]):[0-5]\d"
            maxLength={5}
            placeholder="HH:mm"
            autoComplete="off"
            required
            value={endTime}
            onChange={handleEndChange}
            className={fieldClassName}
            aria-describedby={state.status === 'error' ? 'vote-time-error' : undefined}
          />
        </label>
      </fieldset>
      {state.status === 'error' ? (
        <p id="vote-time-error" role="alert" className="mt-4 text-body-r-14 text-red-400">
          {state.message}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          type="submit"
          size="small"
          className="w-auto max-w-none"
          disabled={isPending || !isChanged}
        >
          {isPending ? '저장 중...' : '변경 사항 저장'}
        </Button>
      </div>
      {isPending ? (
        <p role="status" className="sr-only">
          투표 시간을 저장하고 있습니다.
        </p>
      ) : null}
    </form>
  );
}

export function VoteScheduleEditor({ schedule }: VoteScheduleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  /**
   * 투표 일시중지 / 재개 액션을 호출하고 처리 결과 또는 통신 오류 상태를 반환한다.
   * @param previousState 이전 투표 제어 처리 상태
   * @param formData 제어 의도(intent)가 포함된 폼 데이터
   * @returns 제어 처리 결과 또는 통신 오류 상태
   */
  async function handleControl(
    previousState: VoteControlState,
    formData: FormData,
  ): Promise<VoteControlState> {
    try {
      return await controlVoteAction(previousState, formData);
    } catch {
      return {
        status: 'error',
        message: '투표 상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
      };
    }
  }

  const [controlState, controlAction, isControlling] = useActionState(handleControl, INITIAL_STATE);
  const isPaused =
    schedule.status === 'PAUSED' || (schedule.status === 'IN_PROGRESS' && schedule.paused);
  const canControl = isPaused || (schedule.status === 'IN_PROGRESS' && !schedule.paused);
  const isVoteInProgress = schedule.status === 'IN_PROGRESS' && !schedule.paused;

  /** 투표 시간 편집 모드로 전환한다. */
  function handleEdit() {
    setIsEditing(true);
  }

  /** 투표 시간 편집 모드를 종료한다. */
  function handleClose() {
    setIsEditing(false);
  }

  if (isEditing)
    return <VoteTimeForm schedule={schedule} onCancel={handleClose} onSaved={handleClose} />;

  return (
    <>
      {isVoteInProgress ? (
        <p id="vote-time-edit-notice" className="mt-3 text-body-r-14 text-red-400">
          투표 진행 중에는 시간을 수정할 수 없습니다.
        </p>
      ) : null}
      <dl className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <dt className="text-body-m-16 text-gray-300">시작 시간</dt>
          <dd className={fieldClassName}>
            <time dateTime={schedule.startTime}>
              {timeFormatter.format(new Date(schedule.startTime))}
            </time>
          </dd>
        </div>
        <div className="space-y-2">
          <dt className="text-body-m-16 text-gray-300">마감 시간</dt>
          <dd className={fieldClassName}>
            <time dateTime={schedule.endTime}>
              {timeFormatter.format(new Date(schedule.endTime))}
            </time>
          </dd>
        </div>
      </dl>
      <form action={controlAction} aria-busy={isControlling} className="mt-8 flex flex-wrap gap-4">
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={handleEdit}
          disabled={isControlling || isVoteInProgress}
          aria-describedby={isVoteInProgress ? 'vote-time-edit-notice' : undefined}
        >
          투표 시간 수정
        </Button>
        <Button
          type="submit"
          name="intent"
          value={isPaused ? 'resume' : 'pause'}
          size="small"
          disabled={!canControl || isControlling}
        >
          {isControlling ? '처리 중...' : isPaused ? '투표 재개' : '투표 일시중지'}
        </Button>
      </form>
      {controlState.status === 'error' ? (
        <p role="alert" className="mt-4 text-body-r-14 text-red-400">
          {controlState.message}
        </p>
      ) : null}
      {isControlling ? (
        <p role="status" className="sr-only">
          투표 상태를 변경하고 있습니다.
        </p>
      ) : null}
    </>
  );
}
