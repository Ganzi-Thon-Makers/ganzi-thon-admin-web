import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Icon } from '@/components/ui/icon';
import { getServerAuthTokens } from '@/lib/auth/cookies';

import { updateProjectAction } from '../../_actions/save-project';
import { ProjectForm } from '../../_components/project-form';
import { requestProjectDetail } from '../../_data/project-api';
import type { ProjectFormValues } from '../../_data/project-form';
import { requestProjectTeams } from '../../_data/project-options-api';

interface ProjectEditPageProps {
  params: Promise<{ projectId: string }>;
}

export const instant = false;

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { projectId } = await params;
  if (!/^[1-9]\d*$/.test(projectId) || !Number.isSafeInteger(Number(projectId))) notFound();
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken || !role) redirect('/');
  const [detail, teams] = await Promise.all([
    requestProjectDetail(accessToken, projectId),
    requestProjectTeams(accessToken),
  ]);
  if (!detail.ok) {
    if (detail.status === 404) notFound();
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-gray-50">
        <p role="alert">{detail.message}</p>
        <Link href="/projects">프로젝트 목록으로 이동</Link>
      </main>
    );
  }
  const project = detail.data;
  const initialValues: Partial<ProjectFormValues> = {
    title: project.title,
    platform: project.platform,
    serviceUrl: project.serviceUrl ?? '',
    teamNumber: project.teamNumber,
    teamName: project.teamName,
    memberIds: project.members.map(
      /** 기존 팀원 ID를 폼 초기값으로 옮깁니다.
       * @param member 기존 팀원
       * @returns 회원 ID
       */
      function toMemberId(member) {
        return member.userId;
      },
    ),
    techStack: project.techStack,
    summary: project.summary,
    description: project.description,
    thumbnail: null,
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={role === 'SUPER_ADMIN' ? 'superadmin' : 'admin'}
        activeMenuId="projects"
        className="sticky top-0 h-screen min-h-0 self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 bg-gray-800 px-6 sm:px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>
        <main className="flex-1 px-6 pt-10 pb-10 sm:px-10 xl:px-16 xl:pt-[70px]">
          <h1 className="mb-7 text-display-sb-36">프로젝트 수정</h1>
          <ProjectForm
            mode="edit"
            onSave={updateProjectAction.bind(null, project.id)}
            projectId={project.id}
            initialValues={initialValues}
            initialThumbnailUrl={project.thumbnailUrl}
            initialMembers={project.members}
            teams={teams.ok ? teams.data : []}
            teamError={
              teams.ok
                ? undefined
                : teams.status === 401
                  ? '로그인이 만료되었습니다. 다시 로그인해 주세요.'
                  : teams.message
            }
          />
        </main>
      </div>
    </div>
  );
}
