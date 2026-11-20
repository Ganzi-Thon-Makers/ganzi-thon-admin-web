'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { type ChangeEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pagination } from '@/components/ui/pagination';
import { TextField } from '@/components/ui/text-field';

import type { Project } from '../_data/project-api';
import { ProjectTable, type RankedProject } from './project-table';

const PROJECTS_PER_PAGE = 8;

export interface ProjectListClientProps {
  projects: Project[];
  initialKeyword: string;
}

/** 프로젝트를 득표수와 한국어 프로젝트명 순서로 비교합니다.
 * @param first 첫 번째 프로젝트
 * @param second 두 번째 프로젝트
 * @returns 정렬 순서
 */
function compareProjects(first: Project, second: Project) {
  return second.voteCount - first.voteCount || first.title.localeCompare(second.title, 'ko-KR');
}

/** 내부 API를 통해 이름으로 프로젝트를 검색합니다.
 * @param keyword 프로젝트명 검색어
 * @param signal 취소 신호
 * @returns 조건에 맞는 프로젝트 목록
 */
async function fetchProjects(keyword: string, signal: AbortSignal): Promise<Project[]> {
  const params = new URLSearchParams({ keyword });
  const response = await fetch(`/api/projects?${params}`, { signal });
  const body = (await response.json()) as { data?: Project[]; message?: string };
  if (!response.ok) throw new Error(body.message || '프로젝트 목록을 불러오지 못했습니다.');
  if (!Array.isArray(body.data)) throw new Error('프로젝트 목록 응답 형식이 올바르지 않습니다.');
  return body.data;
}

/** 전체 목록과 검색 결과에서 같은 순위를 표시합니다. */
export function ProjectListClient({ projects, initialKeyword }: ProjectListClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [currentPage, setCurrentPage] = useState(1);
  /** 전체 목록의 정렬 위치를 순위로 부여합니다.
   * @param project 순위를 부여할 프로젝트
   * @param index 정렬된 목록의 위치
   * @returns 순위가 포함된 프로젝트
   */
  function addRank(project: Project, index: number): RankedProject {
    return { ...project, rank: index + 1 };
  }

  const rankedProjects: RankedProject[] = projects.toSorted(compareProjects).map(addRank);

  /** 프로젝트 ID와 전체 순위를 연결합니다.
   * @param project 전체 순위가 부여된 프로젝트
   * @returns ID와 순위 쌍
   */
  function toRankEntry(project: RankedProject): [number, number] {
    return [project.id, project.rank];
  }

  const rankById = new Map(rankedProjects.map(toRankEntry));

  useEffect(
    /** 입력이 멈춘 뒤 검색어를 적용합니다.
     * @returns 대기 중인 갱신을 취소하는 함수
     */
    function scheduleKeywordUpdate() {
      if (searchTerm.trim() === keyword) return;
      /** 검색어를 URL과 요청 상태에 반영합니다. */
      function applyKeyword() {
        const nextKeyword = searchTerm.trim();
        const url = new URL(window.location.href);
        if (nextKeyword) url.searchParams.set('keyword', nextKeyword);
        else url.searchParams.delete('keyword');
        window.history.replaceState(null, '', url);
        setKeyword(nextKeyword);
      }
      const timer = window.setTimeout(applyKeyword, 300);
      /** 대기 중인 검색어 갱신을 취소합니다. */
      function clearKeywordTimer() {
        window.clearTimeout(timer);
      }
      return clearKeywordTimer;
    },
    [searchTerm, keyword],
  );

  /** 현재 검색어에 맞는 프로젝트를 불러옵니다.
   * @param context 요청 취소 신호
   * @returns 검색 결과
   */
  function queryProjects({ signal }: { signal: AbortSignal }) {
    return fetchProjects(keyword, signal);
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['projects', keyword],
    queryFn: queryProjects,
    initialData: keyword === '' ? projects : undefined,
    staleTime: 30_000,
    retry: false,
  });

  const isSearchSettling = searchTerm.trim() !== keyword;

  /** 전체 목록에 있는 프로젝트만 검색 결과에 유지합니다.
   * @param project 검색 결과 프로젝트
   * @returns 전체 목록에 포함된 프로젝트인지 여부
   */
  function hasRank(project: Project) {
    return rankById.has(project.id);
  }

  /** 검색 결과에 전체 목록의 순위를 붙입니다.
   * @param project 검색 결과 프로젝트
   * @returns 전체 순위가 포함된 프로젝트
   */
  function withOriginalRank(project: Project): RankedProject {
    return { ...project, rank: rankById.get(project.id)! };
  }

  /** 검색 결과를 전체 목록의 순위대로 정렬합니다.
   * @param first 첫 번째 프로젝트
   * @param second 두 번째 프로젝트
   * @returns 전체 순위의 비교 결과
   */
  function compareRank(first: RankedProject, second: RankedProject) {
    return first.rank - second.rank;
  }

  const visibleProjects = keyword
    ? (data ?? []).filter(hasRank).map(withOriginalRank).toSorted(compareRank)
    : rankedProjects;
  const pageCount = Math.ceil(visibleProjects.length / PROJECTS_PER_PAGE);
  const pageStart = (currentPage - 1) * PROJECTS_PER_PAGE;
  const pageProjects = visibleProjects.slice(pageStart, pageStart + PROJECTS_PER_PAGE);

  /** 검색 입력과 페이지 상태를 갱신합니다.
   * @param event 검색창 입력 이벤트
   */
  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  /** 선택한 목록 페이지로 이동합니다.
   * @param page 선택한 페이지 번호
   */
  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return (
    <div className="flex flex-col">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <TextField
            aria-label="프로젝트명 검색"
            placeholder="프로젝트명으로 검색하세요."
            value={searchTerm}
            onChange={handleSearchChange}
            leadingIcon={<Icon name="search" size={24} label="검색" />}
            containerClassName="w-full min-w-0 sm:w-[480px] sm:max-w-full sm:shrink-0"
            inputWrapperClassName="h-12 rounded-[4px] bg-gray-800"
            className="text-gray-50 placeholder:text-gray-400"
          />
          {!keyword && !isSearchSettling ? (
            <p className="mt-4 text-body-r-16 text-gray-300">
              득표수가 같으면 이름의 가나다순으로 정렬됩니다.
            </p>
          ) : null}
          {keyword && !isSearchSettling && !isPending && !error && visibleProjects.length === 0 ? (
            <p role="status" className="mt-2 text-body-r-16 text-red-500">
              검색 결과가 존재하지 않습니다.
            </p>
          ) : null}
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/projects/create" />}
          size="sm"
          className="h-12 w-34 rounded-[4px] px-6 text-body-sb-16 text-static-white"
        >
          프로젝트 등록
        </Button>
      </div>
      <div className="mb-7 overflow-x-auto">
        {isSearchSettling || isPending ? (
          <p role="status" className="text-body-r-16 text-gray-300">
            프로젝트 목록을 불러오는 중입니다...
          </p>
        ) : error ? (
          <p role="alert" className="text-body-r-16 text-red-400">
            {error.message}
          </p>
        ) : (
          <ProjectTable projects={pageProjects} emptyMessage={keyword ? '' : undefined} />
        )}
      </div>
      {!isSearchSettling && !isPending && !error && pageCount > 1 ? (
        <Pagination
          pageCount={pageCount}
          page={currentPage}
          onPageChange={handlePageChange}
          className="justify-center [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer"
        />
      ) : null}
    </div>
  );
}
