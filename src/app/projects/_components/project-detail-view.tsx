'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { AdminHeaderContent } from '@/components/layout/admin-header-content';
import { AuthenticatedSidebar } from '@/components/layout/authenticated-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/ui/modal';

import type { ProjectDetail, ProjectPart } from '../_data/project-api';
import { normalizeProjectServiceUrl } from '../_data/project-url';

interface ProjectDetailViewProps {
  project: ProjectDetail;
  role: 'admin' | 'superadmin';
  loginId?: string;
}

interface ProjectThumbnailProps {
  url: string;
  title: string;
}

const PART_ORDER: ProjectPart[] = ['PLAN', 'DESIGN', 'WEB', 'APP', 'SERVER'];

/** 읽기 전용 대표 이미지를 표시하고 이미지 오류 시 대체 문구를 보여줍니다. */
function ProjectThumbnail({ url, title }: ProjectThumbnailProps) {
  const [failed, setFailed] = useState(false);
  let imageUrl: URL | null = null;
  try {
    imageUrl = new URL(url);
  } catch {
    imageUrl = null;
  }
  const valid = imageUrl?.protocol === 'https:' || imageUrl?.protocol === 'http:';

  /** 이미지 로드 실패를 기록합니다. */
  function handleImageError() {
    setFailed(true);
  }

  return (
    <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gray-800 text-body-r-16 text-gray-300 lg:aspect-auto lg:min-h-[350px]">
      {valid && !failed ? (
        <Image
          src={url}
          alt={`${title} 대표 이미지`}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-contain"
          onError={handleImageError}
        />
      ) : (
        <span role="img" aria-label="대표 이미지 없음">
          대표 이미지가 없습니다
        </span>
      )}
    </div>
  );
}

/** 프로젝트의 조회 전용 상세 정보를 표시합니다. */
export function ProjectDetailView({ project, role, loginId }: ProjectDetailViewProps) {
  const deletingRef = useRef(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  /** 프로젝트 삭제 확인 모달을 열고 이전 오류를 지웁니다. */
  function handleDeleteClick() {
    setDeleteErrorMessage('');
    setDeleteModalOpen(true);
  }

  /** 삭제 요청 중에는 모달이 닫히지 않도록 열림 상태를 갱신합니다.
   * @param open 다음 모달 열림 상태
   */
  function handleDeleteModalOpenChange(open: boolean) {
    if (!deletingRef.current) setDeleteModalOpen(open);
  }

  /** 확인된 프로젝트 삭제 요청을 한 번 보내고 성공 시 목록으로 이동합니다. */
  async function handleConfirmDelete() {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setIsDeleting(true);
    setDeleteErrorMessage('');

    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(String(project.id))}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        let message = '프로젝트를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.';
        try {
          const payload = (await response.json()) as { message?: string };
          if (payload.message) message = payload.message;
        } catch {
          // 오류 응답에 JSON 본문이 없어도 기본 안내를 표시합니다.
        }
        setDeleteErrorMessage(message);
        return;
      }

      setDeleteModalOpen(false);
      window.location.replace('/projects');
    } catch {
      setDeleteErrorMessage('서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }

  const membersByPart = PART_ORDER.map(
    /** 파트별 참여자를 응답 순서를 유지해 묶습니다.
     * @param part 표시할 파트
     * @returns 해당 파트와 참여자 목록
     */
    function groupMembers(part) {
      return {
        part,
        members: project.members.filter(
          /** 현재 파트의 참여자인지 확인합니다.
           * @param member 참여자
           * @returns 현재 파트 여부
           */
          function isCurrentPart(member) {
            return member.part === part;
          },
        ),
      };
    },
  ).filter(
    /** 참여자가 있는 파트만 표시합니다.
     * @param group 파트별 참여자 목록
     * @returns 표시 여부
     */
    function hasMembers(group) {
      return group.members.length > 0;
    },
  );

  const serviceUrl = normalizeProjectServiceUrl(project.serviceUrl);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-50">
      <AuthenticatedSidebar
        variant={role}
        activeMenuId="projects"
        className="sticky top-0 h-screen min-h-0 self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeaderContent loginId={loginId} />
        <main className="flex-1 px-6 pt-10 pb-10 sm:px-10 xl:px-16 xl:pt-[70px]">
          <div className="mb-7 flex items-center gap-4">
            <Link
              href="/projects"
              aria-label="프로젝트 목록으로 돌아가기"
              className="flex size-12 shrink-0 items-center justify-center rounded-md text-gray-300 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon name="chevron-left" size={48} />
            </Link>
            <h1 className="text-display-sb-32">프로젝트 상세</h1>
          </div>

          <div className="grid min-w-0 gap-[29px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ProjectThumbnail url={project.thumbnailUrl} title={project.title} />
            <section className="flex min-w-0 flex-col items-start">
              <div className="flex w-full min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-display-sb-32 break-words text-gray-50">{project.title}</h2>
                  <p className="text-title-m-24 break-words text-gray-300">{project.teamName}</p>
                  <p className="mt-1 text-body-r-16 text-gray-300">
                    {project.teamNumber}팀 · 득표 {project.voteCount}표
                  </p>
                </div>
                <Badge
                  color="red"
                  size="medium"
                  className="h-[29px] w-[55px] shrink-0 rounded-[4px] px-0 py-0 text-body-sb-14 text-gray-50"
                >
                  {project.platform}
                </Badge>
              </div>
              <p className="mt-8 w-full text-title-m-20 break-words text-gray-50">
                {project.summary || '한 줄 소개가 없습니다.'}
              </p>
              <p className="mt-4 w-full text-body-r-16 break-words whitespace-pre-wrap text-gray-300">
                {project.description || '상세 설명이 없습니다.'}
              </p>
              {serviceUrl ? (
                <a
                  href={serviceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-[29px] w-32 items-center justify-center gap-1 rounded-[100px] bg-gray-300 px-1 text-body-sb-14 text-gray-900 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  서비스 바로가기 <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="mt-8 inline-flex min-h-10 items-center rounded-full bg-gray-700 px-4 text-body-sb-16 text-gray-300">
                  서비스 URL 없음
                </span>
              )}
            </section>
          </div>

          <section
            aria-label="프로젝트 팀원"
            className="mt-[38px] min-w-0 rounded-xl bg-gray-800 p-6 pt-4"
          >
            {membersByPart.length ? (
              membersByPart.map(
                /** 파트별 참여자 행을 표시합니다.
                 * @param group 파트와 참여자 목록
                 * @returns 참여자 행
                 */
                function renderPart(group) {
                  return (
                    <div
                      key={group.part}
                      className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-1 py-1"
                    >
                      <strong className="text-title-sb-20 text-gray-50">{group.part}</strong>
                      <span className="min-w-0 text-body-r-16 break-words text-gray-300">
                        {group.members
                          .map(
                            /** 참여자 이름을 추출합니다.
                             * @param member 참여자
                             * @returns 이름
                             */
                            function memberName(member) {
                              return member.name;
                            },
                          )
                          .join(' · ')}
                      </span>
                    </div>
                  );
                },
              )
            ) : (
              <p className="text-body-r-16 text-gray-300">참여자 정보가 없습니다.</p>
            )}
          </section>

          <section
            aria-labelledby="tech-stack-heading"
            className="mt-5 min-w-0 rounded-xl bg-gray-800 p-6"
          >
            <h2 id="tech-stack-heading" className="text-title-sb-24 text-gray-50">
              기술 스택
            </h2>
            <p className="mt-3 text-body-r-16 break-words whitespace-pre-wrap text-gray-300">
              {project.techStack || '기술 스택 정보가 없습니다.'}
            </p>
          </section>

          <div className="mt-10 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="h-12 w-[136px] rounded-[4px] bg-gray-700 px-6 text-body-sb-16"
              onClick={handleDeleteClick}
            >
              프로젝트 삭제
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/projects/${project.id}/edit`} />}
              size="lg"
              className="h-12 w-[136px] rounded-[4px] bg-red-500 px-6 text-body-sb-16"
            >
              정보 수정
            </Button>
          </div>
        </main>
      </div>
      <Modal
        open={deleteModalOpen}
        onOpenChange={handleDeleteModalOpenChange}
        title="프로젝트를 삭제할까요?"
        description={
          '프로젝트 정보와 받은 투표, 부스 배정이 함께 초기화 됩니다.\n삭제 후 되돌릴 수 없습니다.'
        }
        cancelLabel="취소"
        confirmLabel={isDeleting ? '삭제 중...' : '프로젝트 삭제'}
        onConfirm={handleConfirmDelete}
        confirmDisabled={isDeleting}
        cancelDisabled={isDeleting}
        disableDismiss={isDeleting}
      >
        {deleteErrorMessage ? (
          <p role="alert" className="text-body-r-16 text-red-400">
            {deleteErrorMessage}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
