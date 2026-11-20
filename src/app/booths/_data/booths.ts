/**
 * Swagger API에서 사용하는 부스 구역 코드 유니온 타입
 */
export type BoothApiZone = 'ZONE1' | 'ZONE2' | 'ZONE3';

/**
 * UI 탭 및 패널에서 사용하는 부스 구역 식별자 유니온 타입
 */
export type BoothZoneId = 'zone1' | 'zone2' | 'zone3';

export interface BoothZoneMetadata {
  /** UI 구역 식별자 */
  id: BoothZoneId;
  /** Swagger API 구역 코드 */
  apiZone: BoothApiZone;
  /** 구역 탭 표시 이름 */
  label: string;
}

/**
 * 부스 구역별 UI 식별자 / API 코드 / 표시 이름 매핑 목록입니다.
 */
export const BOOTH_ZONE_METADATA: readonly BoothZoneMetadata[] = [
  { id: 'zone1', apiZone: 'ZONE1', label: 'Zone 1' },
  { id: 'zone2', apiZone: 'ZONE2', label: 'Zone 2' },
  { id: 'zone3', apiZone: 'ZONE3', label: 'Zone 3' },
] as const;

const API_ZONE_SET = new Set<string>(['ZONE1', 'ZONE2', 'ZONE3']);

export interface BoothItem {
  /** 부스 고유 식별자 (문자열) */
  id: string;
  /** 서버 부스 식별자 */
  boothId: number;
  /** 부스 번호 (2자리 문자열) */
  boothNumber: string;
  /** 부스 위치 설명 (없으면 null) */
  location: string | null;
  /** 배정된 프로젝트 식별자 (미배정 시 undefined) */
  projectId?: number;
  /** 배정된 팀 번호 (2자리 문자열, 미배정 시 undefined) */
  teamNumber?: string;
  /** 배정된 팀명 (미배정 시 undefined) */
  teamName?: string;
  /** 배정된 프로젝트명 (미배정 시 undefined) */
  projectName?: string;
}

export interface BoothRoom {
  /** 호실 고유 식별자 */
  id: string;
  /** 서버 호실 번호 원본 값 */
  roomNumber?: string | number;
  /** 호실 이름 (예: `'104호'`) */
  name: string;
  /** 해당 호실의 부스 목록 */
  booths: BoothItem[];
}

export interface AssignableProjectItem {
  /** 프로젝트 식별자 */
  projectId: number;
  /** 배정 팀 번호 (2자리 문자열) */
  teamNumber: string;
  /** 배정 팀명 */
  teamName: string;
  /** 프로젝트명 */
  projectName: string;
}

export interface BoothZone {
  /** 구역 식별자 */
  id: BoothZoneId;
  /** Swagger API 구역 코드 */
  apiZone: BoothApiZone;
  /** 구역 탭 표시 이름 */
  label: string;
  /** 배정 완료된 부스 수 */
  assignedCount: number;
  /** 전체 부스 수 */
  totalCount: number;
  /** 구역 내 호실 목록 */
  rooms: BoothRoom[];
}

export interface BoothLocation {
  /** 부스가 속한 호실 정보 */
  room: BoothRoom;
  /** 조회된 부스 정보 */
  booth: BoothItem;
}

export interface BoothDetailLocation extends BoothLocation {
  /** 부스가 속한 구역 정보 */
  zone: BoothZone;
}

export interface BoothAssignmentSummary {
  /** 배정 완료된 부스 수 */
  assignedCount: number;
  /** 전체 부스 수 */
  totalCount: number;
}

/**
 * 전달된 값이 지원하는 부스 API 구역 코드인지 확인합니다.
 * @param value 검사할 구역 코드 값
 * @returns ZONE1 / ZONE2 / ZONE3 일치 여부
 */
export function isBoothApiZone(value: unknown): value is BoothApiZone {
  return typeof value === 'string' && API_ZONE_SET.has(value);
}

/**
 * 전달된 값이 구역 식별자인지 확인합니다.
 * @param value 검사할 구역 식별자
 * @returns zone1 / zone2 / zone3 일치 여부
 */
function isBoothZoneId(value: unknown): value is BoothZoneId {
  return value === 'zone1' || value === 'zone2' || value === 'zone3';
}

/**
 * 클라이언트 API 응답의 개별 부스 항목 형식을 확인합니다.
 * @param item 검사할 부스 항목
 * @returns 유효한 BoothItem 여부
 */
function isValidBoothItemModel(item: unknown): item is BoothItem {
  if (item === null || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  if (
    typeof value.id !== 'string' ||
    typeof value.boothId !== 'number' ||
    !Number.isSafeInteger(value.boothId) ||
    typeof value.boothNumber !== 'string' ||
    (typeof value.location !== 'string' && value.location !== null)
  ) {
    return false;
  }
  if (value.projectId !== undefined && !Number.isSafeInteger(value.projectId)) return false;
  if (value.teamNumber !== undefined && typeof value.teamNumber !== 'string') return false;
  if (value.teamName !== undefined && typeof value.teamName !== 'string') return false;
  if (value.projectName !== undefined && typeof value.projectName !== 'string') return false;
  return true;
}

/**
 * 클라이언트 API 응답의 호실 항목 형식을 확인합니다.
 * @param room 검사할 호실 항목
 * @returns 유효한 BoothRoom 여부
 */
function isValidBoothRoomModel(room: unknown): room is BoothRoom {
  if (room === null || typeof room !== 'object') return false;
  const value = room as Record<string, unknown>;
  const hasValidRoomNumber =
    value.roomNumber === undefined ||
    typeof value.roomNumber === 'string' ||
    (typeof value.roomNumber === 'number' && Number.isSafeInteger(value.roomNumber));
  return (
    typeof value.id === 'string' &&
    hasValidRoomNumber &&
    typeof value.name === 'string' &&
    Array.isArray(value.booths) &&
    value.booths.every(isValidBoothItemModel)
  );
}

/**
 * 클라이언트 API 응답의 배정 가능 프로젝트 항목 형식을 확인합니다.
 * @param item 검사할 프로젝트 항목
 * @returns 유효한 AssignableProjectItem 여부
 */
function isValidAssignableProjectItem(item: unknown): item is AssignableProjectItem {
  if (item === null || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  return (
    typeof value.projectId === 'number' &&
    Number.isSafeInteger(value.projectId) &&
    value.projectId >= 0 &&
    typeof value.teamNumber === 'string' &&
    typeof value.teamName === 'string' &&
    typeof value.projectName === 'string'
  );
}

/**
 * 내부 API 응답 데이터가 유효한 배정 가능 프로젝트 목록인지 검증합니다.
 * @param value 검사할 응답 데이터
 * @returns 유효한 AssignableProjectItem 배열 여부
 */
export function isAssignableProjectList(value: unknown): value is AssignableProjectItem[] {
  return Array.isArray(value) && value.every(isValidAssignableProjectItem);
}

/**
 * 응답 본문을 JSON으로 안전하게 파싱합니다.
 * @param response 내부 API 응답 객체
 * @returns 파싱된 JSON 본문 또는 실패 시 null
 */
export async function parseBoothApiJsonSafely(
  response: Response,
): Promise<{ data?: unknown; message?: string } | null> {
  try {
    return (await response.json()) as { data?: unknown; message?: string };
  } catch {
    return null;
  }
}

/**
 * 내부 GET API에서 특정 부스에 배정 가능한 프로젝트 목록을 조회합니다.
 * @param boothId 대상 부스 식별자
 * @param signal 요청 취소 신호
 * @returns 배정 가능한 프로젝트 목록
 */
export async function fetchAssignableProjects(
  boothId: number,
  signal: AbortSignal,
): Promise<AssignableProjectItem[]> {
  const params = new URLSearchParams({ boothId: String(boothId) });
  const response = await fetch(`/api/booths/assignable-projects?${params.toString()}`, {
    cache: 'no-store',
    signal,
  });
  const payload = await parseBoothApiJsonSafely(response);
  if (!response.ok) {
    throw new Error(payload?.message || '배정 가능한 팀 목록을 불러오지 못했습니다.');
  }
  if (!isAssignableProjectList(payload?.data)) {
    throw new Error('배정 가능한 팀 목록 응답 형식이 올바르지 않습니다.');
  }
  return payload.data;
}

/**
 * 클라이언트 API 응답의 구역 항목 형식을 확인합니다.
 * @param zone 검사할 구역 항목
 * @returns 유효한 BoothZone 여부
 */
function isValidBoothZoneModel(zone: unknown): zone is BoothZone {
  if (zone === null || typeof zone !== 'object') return false;
  const value = zone as Record<string, unknown>;
  return (
    isBoothZoneId(value.id) &&
    isBoothApiZone(value.apiZone) &&
    typeof value.label === 'string' &&
    typeof value.assignedCount === 'number' &&
    Number.isSafeInteger(value.assignedCount) &&
    value.assignedCount >= 0 &&
    typeof value.totalCount === 'number' &&
    Number.isSafeInteger(value.totalCount) &&
    value.totalCount >= 0 &&
    Array.isArray(value.rooms) &&
    value.rooms.every(isValidBoothRoomModel)
  );
}

/**
 * 내부 API 응답 데이터가 유효한 부스 구역 목록인지 검증합니다.
 * @param value 검사할 응답 데이터
 * @returns 유효한 BoothZone 배열 여부
 */
export function isBoothZoneList(value: unknown): value is BoothZone[] {
  return Array.isArray(value) && value.every(isValidBoothZoneModel);
}

/**
 * 빈 구역 데이터를 생성합니다.
 * @param metadata 구역 메타데이터
 * @returns 빈 호실 목록과 0건 집계를 가진 구역 객체
 */
function createEmptyBoothZone(metadata: BoothZoneMetadata): BoothZone {
  return {
    id: metadata.id,
    apiZone: metadata.apiZone,
    label: metadata.label,
    assignedCount: 0,
    totalCount: 0,
    rooms: [],
  };
}

/**
 * API 응답 구역 목록을 Zone 1 / Zone 2 / Zone 3 순서로 정규화합니다.
 * 응답에 누락된 구역이 있거나 빈 배열인 경우 빈 구역 데이터로 채웁니다.
 * @param zones API에서 조회한 부스 구역 목록
 * @returns Zone 1 / Zone 2 / Zone 3 순서로 정렬된 구역 목록
 */
export function normalizeBoothZones(zones: BoothZone[]): BoothZone[] {
  const zoneById = new Map<BoothZoneId, BoothZone>();
  for (const zone of zones) {
    if (!zoneById.has(zone.id)) {
      zoneById.set(zone.id, zone);
    }
  }

  /**
   * 메타데이터에 대응하는 구역 데이터를 반환하거나 빈 구역을 생성합니다.
   * @param metadata 대상 구역 메타데이터
   * @returns 정규화된 구역 데이터
   */
  function toNormalizedZone(metadata: BoothZoneMetadata): BoothZone {
    return zoneById.get(metadata.id) ?? createEmptyBoothZone(metadata);
  }

  return BOOTH_ZONE_METADATA.map(toNormalizedZone);
}

/**
 * 구역 식별자에 해당하는 부스 구역 데이터를 조회합니다.
 * @param zoneId 조회할 부스 구역 식별자
 * @param zones 조회 대상 구역 목록
 * @returns 일치하는 부스 구역 정보 (없으면 첫 번째 구역)
 */
export function getBoothZoneById(zoneId: BoothZoneId, zones: BoothZone[]): BoothZone {
  /**
   * 전달된 구역이 대상 식별자와 일치하는지 판별합니다.
   * @param zone 검사할 부스 구역 객체
   * @returns 구역 식별자 일치 여부
   */
  function isMatchingZone(zone: BoothZone): boolean {
    return zone.id === zoneId;
  }

  return zones.find(isMatchingZone) ?? zones[0] ?? createEmptyBoothZone(BOOTH_ZONE_METADATA[0]);
}

/**
 * 구역의 배정 완료 부스 수와 전체 부스 수를 반환합니다.
 * @param zone 집계할 부스 구역 정보
 * @returns 배정 완료 수와 전체 부스 수
 */
export function getBoothAssignmentSummary(zone: BoothZone): BoothAssignmentSummary {
  return {
    assignedCount: zone.assignedCount,
    totalCount: zone.totalCount,
  };
}

/**
 * 구역 진입 시 기본으로 선택할 부스 식별자를 반환합니다.
 * 미배정 부스가 있으면 첫 번째 미배정 부스를, 없으면 첫 번째 부스를 선택합니다.
 * @param zone 대상 부스 구역 정보
 * @returns 기본 선택 부스 식별자
 */
export function getDefaultSelectedBoothId(zone: BoothZone): string {
  for (const room of zone.rooms) {
    for (const booth of room.booths) {
      if (booth.projectId === undefined) {
        return booth.id;
      }
    }
  }

  return zone.rooms[0]?.booths[0]?.id ?? '';
}

/**
 * 구역 내에서 부스 식별자에 해당하는 호실 및 부스 정보를 찾습니다.
 * @param zone 검색할 부스 구역 정보
 * @param boothId 찾을 부스 식별자
 * @returns 호실과 부스 정보 객체 (없으면 undefined)
 */
export function findBoothLocation(zone: BoothZone, boothId: string): BoothLocation | undefined {
  for (const room of zone.rooms) {
    for (const booth of room.booths) {
      if (booth.id === boothId) {
        return { room, booth };
      }
    }
  }

  return undefined;
}

/**
 * 전체 구역 목록에서 부스 식별자에 해당하는 구역 / 호실 / 부스 정보를 찾습니다.
 * @param zones 조회 대상 구역 목록
 * @param boothId 찾을 부스 식별자
 * @returns 구역과 호실, 부스 정보 객체 (없으면 undefined)
 */
export function findBoothDetailById(
  zones: BoothZone[],
  boothId: string,
): BoothDetailLocation | undefined {
  for (const zone of zones) {
    const location = findBoothLocation(zone, boothId);
    if (location) {
      return { zone, ...location };
    }
  }

  return undefined;
}
