import { NextResponse } from 'next/server';

import { createTimetable, getTimetableList } from '@/app/timetables/_data/timetable-api';

/**
 * 슈퍼 관리자의 일정 목록 조회 결과를 반환한다.
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

/**
 * 슈퍼 관리자의 일정 등록 요청을 처리한다.
 * @param request JSON 등록 요청
 * @returns 등록 결과 또는 상태 코드가 포함된 오류 응답
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: '요청 본문 형식이 올바르지 않습니다.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  }
  const result = await createTimetable(body);
  if (!result.ok)
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  return NextResponse.json({ data: result.data }, { status: 201 });
}
