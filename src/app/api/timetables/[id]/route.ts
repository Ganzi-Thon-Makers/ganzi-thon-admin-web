import { type NextRequest, NextResponse } from 'next/server';

import { deleteTimetable, updateTimetable } from '@/app/timetables/_data/timetable-api';

/**
 * 슈퍼 관리자의 일정 삭제 요청을 처리한다.
 * @param _request HTTP 요청 객체
 * @param context 동적 라우트 매개변수 컨텍스트
 * @returns 삭제 결과 또는 상태 코드가 포함된 오류 응답
 */
export async function DELETE(_request: NextRequest, context: RouteContext<'/api/timetables/[id]'>) {
  const { id } = await context.params;
  const result = await deleteTimetable(id);
  if (!result.ok)
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  return NextResponse.json({ data: result.data });
}

/**
 * 슈퍼 관리자의 일정 수정 요청을 처리한다.
 * @param request HTTP 요청 객체
 * @param context 동적 라우트 매개변수 컨텍스트
 * @returns 수정된 일정 또는 상태 코드가 포함된 오류 응답
 */
export async function PUT(request: NextRequest, context: RouteContext<'/api/timetables/[id]'>) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: '요청 본문 형식이 올바르지 않습니다.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  }
  const { id } = await context.params;
  const result = await updateTimetable(id, body);
  if (!result.ok)
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  return NextResponse.json({ data: result.data });
}
