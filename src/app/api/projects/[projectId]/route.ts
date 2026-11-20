import { type NextRequest, NextResponse } from 'next/server';

import { requestDeleteProject } from '@/app/projects/_data/project-api';
import { getServerAuthTokens } from '@/lib/auth/cookies';

/** 인증된 관리자의 프로젝트 삭제 요청을 백오피스 API에 전달합니다.
 * @param _request HTTP 요청 객체
 * @param context 프로젝트 ID가 포함된 라우트 컨텍스트
 * @returns 삭제 결과 또는 상태 코드가 포함된 오류 응답
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext<'/api/projects/[projectId]'>,
) {
  const { projectId } = await context.params;
  if (!/^[1-9]\d*$/.test(projectId) || !Number.isSafeInteger(Number(projectId))) {
    return NextResponse.json(
      { message: '프로젝트 ID가 올바르지 않습니다.', code: 'INVALID_INPUT' },
      { status: 400 },
    );
  }

  const { accessToken } = await getServerAuthTokens();
  if (!accessToken) {
    return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const result = await requestDeleteProject(accessToken, projectId);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }
  return NextResponse.json({ data: result.data });
}
