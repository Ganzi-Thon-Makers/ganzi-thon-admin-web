import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Icon } from '@/components/ui/icon';
import { getServerAuthTokens } from '@/lib/auth/cookies';

import { createProjectAction } from '../_actions/save-project';
import { ProjectForm } from '../_components/project-form';
import { requestProjectTeams } from '../_data/project-options-api';

export const instant = false;

export default async function ProjectCreatePage() {
  const { accessToken, role } = await getServerAuthTokens();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';
  const teamsResult = accessToken ? await requestProjectTeams(accessToken) : null;
  const teamError = !accessToken
    ? '로그인이 필요합니다. 다시 로그인해 주세요.'
    : teamsResult && !teamsResult.ok
      ? teamsResult.status === 401
        ? '로그인이 만료되었습니다. 다시 로그인해 주세요.'
        : teamsResult.message
      : undefined;

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={sidebarVariant}
        activeMenuId="projects"
        className="sticky top-0 h-screen min-h-0 self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-22 shrink-0 items-center justify-end gap-4 bg-gray-800 px-6 sm:px-10">
          <span className="text-body-m-16 text-gray-50">운영 관리자</span>
          <Icon name="user" size={32} />
        </header>
        <main className="flex-1 px-6 pt-10 pb-10 sm:px-10 xl:px-16 xl:pt-[70px]">
          <h1 className="mb-7 text-display-sb-36">프로젝트 등록</h1>
          <ProjectForm
            mode="create"
            onSave={createProjectAction}
            teams={teamsResult?.ok ? teamsResult.data : []}
            teamError={teamError}
          />
        </main>
      </div>
    </div>
  );
}
