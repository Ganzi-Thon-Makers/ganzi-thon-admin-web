import { type NextRequest, NextResponse } from 'next/server';

import { updateBooth } from '@/app/booths/_data/booth-api';

/**
 * 관리자의 부스 전체 수정(교체) 요청을 처리합니다.
 * @param request 모든 부스 수정 필드가 담긴 JSON 요청
 * @param context 동적 라우트 매개변수 컨텍스트
 * @returns 수정 결과 또는 상태 코드가 포함된 오류 응답
 */
export async function PUT(request: NextRequest, context: RouteContext<'/api/booths/[boothId]'>) {
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
  const result = await updateBooth(boothId, body);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}
