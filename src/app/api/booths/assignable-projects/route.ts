import { type NextRequest, NextResponse } from 'next/server';

import { getAssignableProjects } from '@/app/booths/_data/booth-api';

/**
 * 관리자 인증 토큰으로 특정 부스에 배정 가능한 프로젝트 목록을 조회합니다.
 * @param request `boothId` 쿼리 파라미터가 포함된 요청 객체
 * @returns 배정 가능 프로젝트 목록 또는 상태 코드가 포함된 오류 응답
 */
export async function GET(request: NextRequest) {
  const boothId = request.nextUrl.searchParams.get('boothId');
  const result = await getAssignableProjects(boothId);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}
