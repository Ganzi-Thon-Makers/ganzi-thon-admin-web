import { getVoteSchedule, type VoteStatus } from '../_data/vote';
import { VoteScheduleEditor } from './vote-schedule-editor';

const STATUS_LABELS: Record<VoteStatus, string> = {
  NOT_STARTED: '투표 진행 전',
  IN_PROGRESS: '투표 진행 중',
  PAUSED: '투표 일시중지',
  ENDED: '투표 종료',
};

export function VoteScheduleLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="min-h-[326px] rounded-lg bg-gray-800 p-8 text-body-m-16 text-gray-300"
    >
      투표 일정을 불러오고 있습니다.
    </div>
  );
}

export async function VoteScheduleSection() {
  const result = await getVoteSchedule();

  if (!result.ok) {
    return (
      <div role="alert" className="min-h-[326px] space-y-4 rounded-lg bg-gray-800 p-8">
        <h2 className="text-title-sb-24">투표 일정을 불러오지 못했습니다.</h2>
        <p className="text-body-r-16 text-gray-200">{result.message}</p>
        <a
          href="/votes"
          className="inline-flex rounded border border-gray-400 px-5 py-3 text-body-sb-16 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
        >
          다시 불러오기
        </a>
      </div>
    );
  }

  const schedule = result.data;
  const status = schedule.paused && schedule.status === 'IN_PROGRESS' ? 'PAUSED' : schedule.status;

  return (
    <section
      aria-labelledby="vote-schedule-title"
      className="min-h-[326px] rounded-lg bg-gray-800 p-8"
    >
      <span
        className={`inline-flex rounded px-3 py-1 text-body-sb-14 ${status === 'IN_PROGRESS' ? 'bg-red-500 text-white' : 'bg-red-100 text-gray-900'}`}
      >
        {STATUS_LABELS[status]}
      </span>
      <h2 id="vote-schedule-title" className="mt-6 text-title-sb-24">
        투표 시간
      </h2>
      <VoteScheduleEditor schedule={schedule} />
    </section>
  );
}
