import { type NextRequest, NextResponse } from 'next/server';

import { requestProjectList } from '@/app/projects/_data/project-api';
import { getServerAuthTokens } from '@/lib/auth/cookies';

/** 인증된 프로젝트 목록·검색 요청을 서버 API에 전달합니다.
 * @param request 검색어가 담긴 요청
 * @returns 프로젝트 목록 또는 API 오류
 */
export async function GET(request: NextRequest) {
  const { accessToken } = await getServerAuthTokens();
  if (!accessToken) {
    return NextResponse.json(
      { message: '로그인이 필요합니다. 다시 로그인해주세요.' },
      { status: 401 },
    );
  }
  const keyword = request.nextUrl.searchParams.get('keyword')?.trim() ?? '';
  const result = await requestProjectList(accessToken, keyword);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ data: result.data });
}
