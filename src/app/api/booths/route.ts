import { type NextRequest, NextResponse } from 'next/server';

import { getBoothList } from '@/app/booths/_data/booth-api';
import { type BoothApiZone, isBoothApiZone } from '@/app/booths/_data/booths';

/**
 * 관리자 인증 토큰으로 부스 현황 목록(전체 또는 특정 구역)을 조회합니다.
 * @param request 선택적 `zone` 쿼리 파라미터가 포함된 요청 객체
 * @returns 구역별 부스 현황 목록 또는 상태 코드가 포함된 오류 응답
 */
export async function GET(request: NextRequest) {
  const rawZone = request.nextUrl.searchParams.get('zone');
  let zone: BoothApiZone | undefined;

  if (rawZone !== null) {
    const trimmedZone = rawZone.trim();
    if (!isBoothApiZone(trimmedZone)) {
      return NextResponse.json(
        { message: '부스 구역 값이 올바르지 않습니다.', code: 'INVALID_INPUT' },
        { status: 400 },
      );
    }
    zone = trimmedZone;
  }

  const result = await getBoothList(zone);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}
