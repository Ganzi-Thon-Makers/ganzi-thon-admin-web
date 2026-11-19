import { type NextRequest, NextResponse } from 'next/server';

import { requestUserList, type UserListQuery } from '@/app/users/_data/user-api';
import { getServerAuthTokens } from '@/lib/auth/cookies';

/** 화면의 검색 조건을 인증된 백오피스 목록 API에 전달합니다.
 * @param request 검색·필터 조건이 담긴 요청
 * @returns 사용자 목록 또는 API 오류
 */
export async function GET(request: NextRequest) {
  const { accessToken } = await getServerAuthTokens();
  if (!accessToken) {
    return NextResponse.json(
      { message: '로그인이 필요합니다. 다시 로그인해주세요.' },
      { status: 401 },
    );
  }

  const params = request.nextUrl.searchParams;
  const query: UserListQuery = {};
  const keyword = params.get('keyword')?.trim();
  if (keyword) query.keyword = keyword;

  for (const [param, field] of [
    ['luckyDrawEntered', 'luckyDrawEntered'],
    ['completed', 'completed'],
  ] as const) {
    const value = params.get(param);
    if (value === null) continue;
    if (value !== 'true' && value !== 'false') {
      return NextResponse.json({ message: '필터 값이 올바르지 않습니다.' }, { status: 400 });
    }
    query[field] = value === 'true';
  }

  const result = await requestUserList(accessToken, query);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
