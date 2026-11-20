'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  type BoothItem,
  type BoothRoom,
  type BoothZone,
  type BoothZoneId,
  findBoothLocation,
  getBoothAssignmentSummary,
  getBoothZoneById,
  getDefaultSelectedBoothId,
  isBoothZoneList,
  normalizeBoothZones,
} from '../_data/booths';
import { BoothDetailPanel } from './booth-detail-panel';

export interface BoothListClientProps {
  /** 서버에서 조회한 초기 부스 구역 목록 (조회 실패 시 없음) */
  initialZones?: BoothZone[];
  /** 서버 초기 조회 실패 시 표시할 오류 메시지 */
  initialErrorMessage?: string;
}

interface ZoneTabButtonProps {
  /** 구역 정보 */
  zone: BoothZone;
  /** 현재 선택된 구역인지 여부 */
  isSelected: boolean;
  /** 구역 선택 콜백 */
  onSelect: (zoneId: BoothZoneId) => void;
}

interface BoothCardProps {
  /** 표시할 부스 정보 */
  booth: BoothItem;
  /** 현재 상세 패널에 선택된 부스인지 여부 */
  isSelected: boolean;
  /** 부스 선택 콜백 */
  onSelect: (boothId: string) => void;
}

interface BoothRoomSectionProps {
  /** 표시할 호실 정보 */
  room: BoothRoom;
  /** 현재 선택된 부스 식별자 */
  selectedBoothId: string;
  /** 부스 선택 콜백 */
  onSelectBooth: (boothId: string) => void;
}

/**
 * 응답 본문을 JSON으로 읽고 실패하면 null을 반환합니다.
 * @param response 내부 API 응답
 * @returns 파싱된 JSON 본문 또는 null
 */
async function parseJsonSafely(
  response: Response,
): Promise<{ data?: unknown; message?: string } | null> {
  try {
    return (await response.json()) as { data?: unknown; message?: string };
  } catch {
    return null;
  }
}

/**
 * 인증된 내부 GET API에서 부스 현황 목록을 조회합니다.
 * @param context TanStack Query가 전달한 요청 취소 신호
 * @returns 구역별 부스 현황 목록
 */
export async function queryBooths({ signal }: { signal: AbortSignal }): Promise<BoothZone[]> {
  const response = await fetch('/api/booths', { cache: 'no-store', signal });
  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new Error(payload?.message || '부스 현황을 불러오지 못했습니다.');
  }
  if (!isBoothZoneList(payload?.data)) {
    throw new Error('부스 현황 응답 형식이 올바르지 않습니다.');
  }
  return payload.data;
}

/**
 * 부스 현황 목록 로딩 상태를 표시합니다.
 */
export function BoothListLoading() {
  return (
    <p role="status" aria-busy="true" className="text-body-r-16 text-gray-300">
      부스 현황을 불러오는 중입니다...
    </p>
  );
}

/**
 * 구역 전환 탭 버튼을 렌더링합니다.
 */
function ZoneTabButton({ zone, isSelected, onSelect }: ZoneTabButtonProps) {
  /**
   * 탭 버튼 클릭 시 해당 구역 식별자를 상위 상태로 전달합니다.
   */
  function handleClick() {
    onSelect(zone.id);
  }

  return (
    <Button
      type="button"
      role="tab"
      id={`booth-zone-tab-${zone.id}`}
      aria-selected={isSelected}
      aria-controls={`booth-zone-panel-${zone.id}`}
      variant={isSelected ? 'primary' : 'secondary'}
      size="small"
      onClick={handleClick}
      className="h-12 w-34 rounded-[4px] text-body-sb-16"
    >
      {zone.label}
    </Button>
  );
}

/**
 * 개별 부스의 번호와 배정 상태(팀 번호 / 프로젝트명) 카드를 렌더링합니다.
 * 배정된 부스는 상세 페이지로 이동하고, 미배정 부스는 우측 배정 패널 선택 동작을 수행합니다.
 */
function BoothCard({ booth, isSelected, onSelect }: BoothCardProps) {
  const isAssigned = booth.projectId !== undefined;
  const teamLabel = isAssigned && booth.teamNumber ? `${booth.teamNumber}팀` : '미배정';
  const projectLabel = isAssigned
    ? booth.projectName || booth.teamName || '배정 프로젝트'
    : '팀 배정 가능';
  const cardClassName = cn(
    'flex w-full cursor-pointer flex-col items-start rounded-lg bg-gray-900 p-5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500',
    isSelected ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-700 hover:border-gray-500',
  );
  const cardContent = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[72px] flex-col items-center justify-center rounded-[4px] px-2 py-[13px] text-center font-sans text-body-sb-14 text-gray-50 transition-colors',
          isAssigned ? 'bg-red-500' : 'bg-gray-600',
        )}
      >
        {booth.boothNumber}
      </span>
      <p
        className={
          isAssigned ? 'mt-4 text-body-sb-16 text-gray-50' : 'mt-4 text-body-sb-16 text-gray-300'
        }
      >
        {teamLabel}
      </p>
      <p className="mt-1 w-full truncate text-body-r-14 text-gray-400" title={projectLabel}>
        {projectLabel}
      </p>
    </>
  );

  /**
   * 미배정 부스 카드 클릭 시 선택된 부스 식별자를 상위로 전달합니다.
   */
  function handleCardClick() {
    onSelect(booth.id);
  }

  if (isAssigned) {
    return (
      <Link
        href={`/booths/${encodeURIComponent(booth.id)}`}
        aria-label={`${booth.boothNumber}번 부스 ${teamLabel} 상세 보기`}
        className={cardClassName}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCardClick}
      aria-pressed={isSelected}
      aria-label={`${booth.boothNumber}번 부스 ${teamLabel}`}
      className={cardClassName}
    >
      {cardContent}
    </button>
  );
}

/**
 * 호실 단위의 부스 목록 섹션을 렌더링합니다.
 */
function BoothRoomSection({ room, selectedBoothId, onSelectBooth }: BoothRoomSectionProps) {
  /**
   * 호실 내 개별 부스 카드를 생성합니다.
   * @param booth 표시할 부스 항목
   * @returns 부스 카드 엘리먼트
   */
  function renderBoothCard(booth: BoothItem) {
    return (
      <BoothCard
        key={booth.id}
        booth={booth}
        isSelected={booth.id === selectedBoothId}
        onSelect={onSelectBooth}
      />
    );
  }

  return (
    <section aria-labelledby={`booth-room-${room.id}`} className="rounded-xl bg-gray-800 p-7">
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h2 id={`booth-room-${room.id}`} className="text-title-sb-24 text-gray-50">
          {room.name}
        </h2>
        <p className="text-body-r-14 text-gray-400">부스를 선택해 배정 현황을 확인하세요.</p>
      </div>
      {room.booths.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(164px,1fr))]">
          {room.booths.map(renderBoothCard)}
        </div>
      ) : (
        <p role="status" className="text-body-r-14 text-gray-400">
          이 호실에 등록된 부스가 없습니다.
        </p>
      )}
    </section>
  );
}

/**
 * 부스 관리 Zone 1 / Zone 2 / Zone 3 목록과 우측 상세 패널을 표시합니다.
 */
export function BoothListClient({ initialZones, initialErrorMessage }: BoothListClientProps) {
  /**
   * 초기 부스 목록이 전달된 경우 Zone 1의 기본 선택 부스 식별자를 계산합니다.
   * @returns 초기 선택 부스 식별자
   */
  function resolveInitialBoothId(): string {
    if (!initialZones) return '';
    const initialNormalizedZones = normalizeBoothZones(initialZones);
    return getDefaultSelectedBoothId(getBoothZoneById('zone1', initialNormalizedZones));
  }

  const [selectedZoneId, setSelectedZoneId] = useState<BoothZoneId>('zone1');
  const [selectedBoothId, setSelectedBoothId] = useState<string>(resolveInitialBoothId);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['booths'],
    queryFn: queryBooths,
    initialData: initialZones,
    enabled: initialErrorMessage === undefined,
    staleTime: 30_000,
    retry: false,
  });

  const errorMessage = error?.message ?? (data === undefined ? initialErrorMessage : undefined);

  /**
   * 실패한 부스 현황 조회를 다시 요청합니다.
   */
  function handleRetry() {
    void refetch();
  }

  if (isFetching && data === undefined) {
    return <BoothListLoading />;
  }

  if (errorMessage) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-4 rounded-xl border border-gray-700 bg-gray-800 p-7"
      >
        <p className="text-body-r-16 text-red-400">{errorMessage}</p>
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={isFetching}
          onClick={handleRetry}
        >
          다시 불러오기
        </Button>
      </div>
    );
  }

  const zones = normalizeBoothZones(data ?? []);
  const activeZone = getBoothZoneById(selectedZoneId, zones);
  const { assignedCount, totalCount } = getBoothAssignmentSummary(activeZone);
  const resolvedLocation =
    findBoothLocation(activeZone, selectedBoothId) ??
    findBoothLocation(activeZone, getDefaultSelectedBoothId(activeZone));
  const activeBoothId = resolvedLocation?.booth.id ?? '';

  /**
   * 사용자가 선택한 구역 탭으로 상태를 전환하고 해당 구역의 기본 부스를 선택합니다.
   * @param zoneId 전환할 구역 식별자
   */
  function handleZoneSelect(zoneId: BoothZoneId) {
    setSelectedZoneId(zoneId);
    const nextZone = getBoothZoneById(zoneId, zones);
    setSelectedBoothId(getDefaultSelectedBoothId(nextZone));
  }

  /**
   * 사용자가 선택한 부스 카드를 우측 상세 패널 대상으로 설정합니다.
   * @param boothId 선택된 부스 식별자
   */
  function handleBoothSelect(boothId: string) {
    setSelectedBoothId(boothId);
  }

  /**
   * 구역 선택 탭 버튼을 렌더링합니다.
   * @param zone 렌더링할 구역 정보
   * @returns 구역 탭 버튼 엘리먼트
   */
  function renderZoneTab(zone: BoothZone) {
    return (
      <ZoneTabButton
        key={zone.id}
        zone={zone}
        isSelected={zone.id === activeZone.id}
        onSelect={handleZoneSelect}
      />
    );
  }

  /**
   * 선택된 구역의 호실별 부스 섹션을 렌더링합니다.
   * @param room 렌더링할 호실 정보
   * @returns 호실 섹션 엘리먼트
   */
  function renderRoomSection(room: BoothRoom) {
    return (
      <BoothRoomSection
        key={room.id}
        room={room}
        selectedBoothId={activeBoothId}
        onSelectBooth={handleBoothSelect}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="부스 구역 선택"
          className="flex flex-wrap items-center gap-4"
        >
          {zones.map(renderZoneTab)}
        </div>
        <Badge
          color="ivory"
          size="medium"
          aria-label={`배정 현황 ${assignedCount} / ${totalCount}`}
        >
          배정 {assignedCount} / {totalCount}
        </Badge>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div
          role="tabpanel"
          id={`booth-zone-panel-${activeZone.id}`}
          aria-labelledby={`booth-zone-tab-${activeZone.id}`}
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          {activeZone.rooms.length > 0 ? (
            activeZone.rooms.map(renderRoomSection)
          ) : (
            <section className="rounded-xl border border-gray-700 bg-gray-800 p-7">
              <p role="status" className="text-body-r-16 text-gray-300">
                {activeZone.label}에 등록된 부스가 없습니다.
              </p>
            </section>
          )}
        </div>

        {resolvedLocation ? (
          <BoothDetailPanel
            key={`${resolvedLocation.booth.id}-${resolvedLocation.booth.teamNumber ?? 'unassigned'}`}
            zoneLabel={activeZone.label}
            roomName={resolvedLocation.room.name}
            booth={resolvedLocation.booth}
          />
        ) : null}
      </div>
    </div>
  );
}
