/** 타임테이블 기본 행사 날짜 */
export const TIMETABLE_EVENT_DATE = '2026-11-21';

/**
 * 시각 또는 일시 문자열을 행사일 한국 표준시 기준의 밀리초 타임스탬프로 변환한다.
 * @param value HH:mm / HH:mm:ss 시각 또는 ISO 일시
 * @returns 밀리초 단위 타임스탬프
 */
export function timetableTimestamp(value: string): number {
  const dateTime = value.includes('T') ? value : `${TIMETABLE_EVENT_DATE}T${value}`;
  return Date.parse(/(Z|[+-]\d{2}:?\d{2})$/.test(dateTime) ? dateTime : `${dateTime}+09:00`);
}
