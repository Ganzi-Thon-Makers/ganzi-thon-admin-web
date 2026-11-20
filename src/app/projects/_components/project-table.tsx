import { Icon } from '@/components/ui/icon';

import type { Project } from '../_data/project-api';

export interface RankedProject extends Project {
  rank: number;
}

export interface ProjectTableProps {
  projects: RankedProject[];
  emptyMessage?: string;
}

/** 프로젝트 목록을 순위와 함께 표로 표시합니다. */
export function ProjectTable({
  projects,
  emptyMessage = '표시할 프로젝트가 없습니다.',
}: ProjectTableProps) {
  /** 프로젝트 한 행을 렌더링합니다.
   * @param project 표시할 프로젝트
   * @returns 프로젝트 정보 행
   */
  function renderProjectRow(project: RankedProject) {
    return (
      <tr
        key={project.id}
        className="h-[72px] bg-gray-800 align-middle text-body-r-16 text-gray-100"
      >
        <th scope="row" className="px-6 text-left text-body-sb-16 text-gray-50">
          {String(project.rank).padStart(2, '0')}
        </th>
        <td className="px-6 text-left text-body-sb-16 text-gray-50">{project.title}</td>
        <td className="px-6 text-left">{project.serviceUrl || '-'}</td>
        <td className="px-6 text-left">{project.voteCount}표</td>
        <td className="px-6 text-left">{String(project.teamNumber).padStart(2, '0')}</td>
        <td className="pr-10 pl-6 text-right">
          <span
            className="inline-flex cursor-pointer items-center gap-1 text-body-r-16 text-gray-100"
            aria-label="상세 보기 기능 준비 중"
          >
            상세 보기 <Icon name="chevron-right" size={24} />
          </span>
        </td>
      </tr>
    );
  }

  return (
    <table className="w-full min-w-[1200px] table-fixed border-collapse text-left font-sans">
      <colgroup>
        <col className="w-[7%]" />
        <col className="w-[27%]" />
        <col className="w-[30%]" />
        <col className="w-[12%]" />
        <col className="w-[10%]" />
        <col className="w-[14%]" />
      </colgroup>
      <thead className="h-14 bg-gray-700 text-body-m-16 text-gray-300">
        <tr>
          <th scope="col" className="px-6 font-medium">
            순위
          </th>
          <th scope="col" className="px-6 font-medium">
            프로젝트명
          </th>
          <th scope="col" className="px-6 font-medium">
            프로젝트 URL
          </th>
          <th scope="col" className="px-6 font-medium">
            득표수
          </th>
          <th scope="col" className="px-6 font-medium">
            팀번호
          </th>
          <th scope="col" className="px-6 font-medium" aria-label="상세 보기" />
        </tr>
      </thead>
      <tbody>
        {projects.length > 0 ? (
          projects.map(renderProjectRow)
        ) : (
          <tr>
            <td colSpan={6} className="h-56 bg-gray-800 text-center text-body-r-16 text-gray-400">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
