import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getServerAuthSession } from '@/lib/auth/cookies';

import {
  BoothDetailForm,
  type BoothRoomOption,
  type BoothZoneRoomOption,
} from '../_components/booth-detail-form';
import { BoothPageShell } from '../_components/booth-page-shell';
import { getAssignableProjects, getBoothList, validateBoothId } from '../_data/booth-api';
import {
  type AssignableProjectItem,
  type BoothRoom,
  type BoothZone,
  findBoothDetailById,
  normalizeBoothZones,
} from '../_data/booths';

export const instant = false;

interface BoothDetailPageProps {
  /** 동적 부스 상세 경로 매개변수 */
  params: Promise<{ boothId: string }>;
}

interface BoothDetailDataProps {
  /** 동적 부스 상세 경로 매개변수 */
  params: Promise<{ boothId: string }>;
}

/**
 * 구역 목록에서 폼의 구역 / 호수 드롭다운에 필요한 최소 선택 옵션만 추출합니다.
 * @param zones 정규화된 구역별 부스 목록
 * @returns 직렬화 크기를 최소화한 구역 / 호실 옵션 목록
 */
function toZoneRoomOptions(zones: BoothZone[]): BoothZoneRoomOption[] {
  /**
   * 호실 정보에서 호실 선택 옵션을 추출합니다.
   * @param room 호실 모델
   * @returns 호실 번호와 표시 이름
   */
  function toRoomOption(room: BoothRoom): BoothRoomOption {
    return {
      roomNumber: room.roomNumber ?? room.name.replace(/호$/, ''),
      name: room.name,
    };
  }

  /**
   * 구역 정보에서 구역 / 호실 선택 옵션을 추출합니다.
   * @param zone 구역 모델
   * @returns 구역 코드 / 라벨 / 호실 옵션
   */
  function toZoneOption(zone: BoothZone): BoothZoneRoomOption {
    return {
      apiZone: zone.apiZone,
      label: zone.label,
      rooms: zone.rooms.map(toRoomOption),
    };
  }

  return zones.map(toZoneOption);
}

/**
 * 전체 부스 현황과 배정 가능 팀 목록을 병렬 조회해 부스 상세 수정 폼에 전달합니다.
 */
async function BoothDetailData({ params }: BoothDetailDataProps) {
  const { boothId } = await params;
  const validatedId = validateBoothId(boothId);
  if (!validatedId.ok) {
    notFound();
  }

  const [boothResult, assignableResult] = await Promise.all([
    getBoothList(),
    getAssignableProjects(validatedId.data),
  ]);

  if (!boothResult.ok) {
    const isUnauthorized = boothResult.status === 401;
    return (
      <section
        role="alert"
        className="flex flex-col items-start gap-4 rounded-xl border border-gray-700 bg-gray-800 p-7"
      >
        <p className="text-body-r-16 text-red-400">{boothResult.message}</p>
        <Link
          href={isUnauthorized ? '/' : '/booths'}
          className="text-body-sb-16 text-gray-200 underline hover:text-white"
        >
          {isUnauthorized ? '로그인으로 이동' : '부스 목록으로 돌아가기'}
        </Link>
      </section>
    );
  }

  const detail = findBoothDetailById(boothResult.data, boothId);
  if (!detail) {
    notFound();
  }

  const { zone, room, booth } = detail;
  const zoneRoomOptions = toZoneRoomOptions(normalizeBoothZones(boothResult.data));
  const initialProject: AssignableProjectItem | null =
    booth.projectId !== undefined
      ? {
          projectId: booth.projectId,
          teamNumber: booth.teamNumber ?? '',
          teamName: booth.teamName ?? '',
          projectName: booth.projectName ?? '',
        }
      : null;

  return (
    <BoothDetailForm
      key={`${booth.boothId}-${zone.apiZone}-${String(room.roomNumber ?? room.name)}-${booth.boothNumber}-${booth.location ?? ''}-${String(booth.projectId ?? 'unassigned')}`}
      boothId={booth.boothId}
      zoneRoomOptions={zoneRoomOptions}
      initialAssignableProjects={assignableResult.ok ? assignableResult.data : undefined}
      initialAssignableProjectsError={assignableResult.ok ? undefined : assignableResult.message}
      initialZone={zone.apiZone}
      initialRoomNumber={room.roomNumber ?? room.name.replace(/호$/, '')}
      initialRoomName={room.name}
      initialBoothNumber={booth.boothNumber}
      initialLocation={booth.location ?? ''}
      initialProject={initialProject}
    />
  );
}

/** 부스 상세 및 팀 배정 화면입니다. */
export default async function BoothDetailPage({ params }: BoothDetailPageProps) {
  const { role } = await getServerAuthSession();
  const sidebarVariant = role === 'SUPER_ADMIN' ? 'superadmin' : 'admin';

  return (
    <BoothPageShell sidebarVariant={sidebarVariant}>
      <div className="mb-7 flex flex-col gap-2">
        <h1 className="text-display-sb-36 text-gray-50">부스 상세 및 팀 배정</h1>
        <p className="text-body-r-14 text-gray-400">
          구역과 위치 정보를 확인하고 부스에 참가팀을 배정하세요.
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" aria-busy="true" className="text-body-r-16 text-gray-300">
            부스 상세 정보를 불러오는 중입니다...
          </p>
        }
      >
        <BoothDetailData params={params} />
      </Suspense>
    </BoothPageShell>
  );
}
