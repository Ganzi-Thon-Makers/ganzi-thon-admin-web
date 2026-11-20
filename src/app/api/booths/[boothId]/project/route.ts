import { type NextRequest, NextResponse } from 'next/server';

import { assignBoothProject, unassignBoothProject } from '@/app/booths/_data/booth-api';

/**
 * 관리자의 부스 팀 배정 요청을 처리합니다.
 * @param request `projectId`가 담긴 JSON 요청
 * @param context 동적 라우트 매개변수 컨텍스트
 * @returns 배정 결과 또는 상태 코드가 포함된 오류 응답
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext<'/api/booths/[boothId]/project'>,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: '요청 본문 형식이 올바르지 않습니다.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  }

  const { boothId } = await context.params;
  const result = await assignBoothProject(boothId, body);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}

/**
 * 관리자의 부스 팀 배정 취소 요청을 처리합니다.
 * @param _request HTTP 요청 객체
 * @param context 동적 라우트 매개변수 컨텍스트
 * @returns 배정 취소 결과 또는 상태 코드가 포함된 오류 응답
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext<'/api/booths/[boothId]/project'>,
) {
  const { boothId } = await context.params;
  const result = await unassignBoothProject(boothId);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}
