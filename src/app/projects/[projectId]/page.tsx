import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { getServerAuthTokens } from '@/lib/auth/cookies';

import { ProjectDetailView } from '../_components/project-detail-view';
import { requestProjectDetail } from '../_data/project-api';

export const instant = false;

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

/** 프로젝트 ID로 상세 정보를 조회해 화면을 표시합니다. */
async function ProjectDetailData({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  if (!/^[1-9]\d*$/.test(projectId) || !Number.isSafeInteger(Number(projectId))) notFound();

  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken || !role) redirect('/');

  const result = await requestProjectDetail(accessToken, projectId);
  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-900 px-6 text-center text-gray-50">
        <h1 className="text-display-sb-32">
          {result.status === 401
            ? '로그인이 만료되었습니다'
            : result.status === 403
              ? '프로젝트 조회 권한이 없습니다'
              : '프로젝트 정보를 불러오지 못했습니다'}
        </h1>
        <p role="alert" className="text-body-r-16 text-gray-300">
          {result.message}
        </p>
        <Link
          href={result.status === 401 ? '/' : '/projects'}
          className="text-body-sb-16 text-red-400 underline"
        >
          {result.status === 401 ? '로그인으로 이동' : '프로젝트 목록으로 이동'}
        </Link>
      </main>
    );
  }

  return (
    <ProjectDetailView
      project={result.data}
      role={role === 'SUPER_ADMIN' ? 'superadmin' : 'admin'}
    />
  );
}

/** 상세 정보가 로드되는 동안 상태 문구를 표시합니다. */
export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return (
    <Suspense
      fallback={
        <main
          role="status"
          className="min-h-screen bg-gray-900 px-10 py-12 text-body-r-16 text-gray-300"
        >
          프로젝트 정보를 불러오는 중입니다...
        </main>
      }
    >
      <ProjectDetailData params={params} />
    </Suspense>
  );
}
