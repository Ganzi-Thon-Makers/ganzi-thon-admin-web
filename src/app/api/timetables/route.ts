import { NextResponse } from 'next/server';

import { getTimetableList } from '@/app/timetables/_data/timetable-api';

/**
 * 슈퍼 관리자의 일정 목록 조회 결과를 반환합니다.
 * @returns 일정 목록 또는 상태 코드가 포함된 오류 응답
 */
export async function GET() {
  const result = await getTimetableList();
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }
  return NextResponse.json({ data: result.data });
}
