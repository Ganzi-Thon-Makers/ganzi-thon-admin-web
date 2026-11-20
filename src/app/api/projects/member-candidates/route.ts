import { type NextRequest, NextResponse } from 'next/server';

import { requestProjectMemberCandidates } from '@/app/projects/_data/project-options-api';
import { getServerAuthTokens } from '@/lib/auth/cookies';

/** 로그인한 관리자에게 검색된 팀원 후보를 반환합니다.
 * @param request 검색어를 포함한 요청
 * @returns 후보 목록 또는 API 오류
 */
export async function GET(request: NextRequest) {
  const { accessToken } = await getServerAuthTokens();
  if (!accessToken) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  const keyword = request.nextUrl.searchParams.get('keyword')?.trim() ?? '';
  const result = await requestProjectMemberCandidates(accessToken, keyword);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ data: result.data });
}
