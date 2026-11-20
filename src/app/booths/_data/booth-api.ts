import 'server-only';

import { requestServerApi } from '@/lib/api/server-client';
import type { ApiErrorCode, ApiResult, ApiSuccessResponse } from '@/lib/api/types';
import { getServerAuthTokens, isBackofficeRole } from '@/lib/auth/cookies';

import {
  type AssignableProjectItem,
  BOOTH_ZONE_METADATA,
  type BoothApiZone,
  type BoothItem,
  type BoothRoom,
  type BoothZone,
  type BoothZoneMetadata,
  isBoothApiZone,
} from './booths';

interface BoothProjectResponse {
  projectId: number;
  teamNumber: number;
  teamName: string;
  title: string;
}

interface BoothResponseItem {
  boothId: number;
  boothNumber: number;
  location: string | null;
  project: BoothProjectResponse | null;
}

interface BoothRoomResponseItem {
  roomNumber: string | number;
  booths: BoothResponseItem[];
}

interface BoothZoneResponseItem {
  zone: BoothApiZone;
  assignedCount: number;
  totalCount: number;
  rooms: BoothRoomResponseItem[];
}

export interface AssignBoothProjectRequest {
  /** 배정할 프로젝트 식별자 */
  projectId: number;
}

export interface UpdateBoothRequest {
  /** 변경할 구역 코드 */
  zone: BoothApiZone;
  /** 변경할 호실 번호 */
  roomNumber: string | number;
  /** 변경할 부스 번호 */
  boothNumber: number;
  /** 변경할 위치 정보 (미입력 시 null) */
  location: string | null;
  /** 배정할 프로젝트 식별자 (미배정 시 null) */
  projectId: number | null;
}

const METADATA_BY_API_ZONE = new Map<BoothApiZone, BoothZoneMetadata>(
  BOOTH_ZONE_METADATA.map(
    /**
     * API 구역 코드와 메타데이터 쌍을 생성합니다.
     * @param metadata 구역 메타데이터
     * @returns API 코드와 메타데이터 튜플
     */
    function toEntry(metadata: BoothZoneMetadata): [BoothApiZone, BoothZoneMetadata] {
      return [metadata.apiZone, metadata];
    },
  ),
);

/**
 * 부스 또는 팀 번호를 2자리 이상 문자열로 포맷합니다.
 * @param value 포맷할 정수 번호
 * @returns 0 패딩이 적용된 번호 문자열
 */
function formatTwoDigitNumber(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * 호실 번호를 화면 표시용 호실 이름으로 변환합니다.
 * @param roomNumber 서버 응답의 호실 번호 또는 이름
 * @returns 화면에 표시할 호실 이름
 */
function formatRoomName(roomNumber: string | number): string {
  const raw = typeof roomNumber === 'number' ? String(roomNumber) : roomNumber.trim();
  return /^\d+$/.test(raw) ? `${raw}호` : raw;
}

/**
 * 입력 오류 응답 결과를 생성합니다.
 * @param message 사용자에게 표시할 오류 메시지
 * @returns 400 INVALID_INPUT 오류 결과
 */
function invalidBoothInput(message: string): ApiResult<never> {
  return { ok: false, status: 400, code: 'INVALID_INPUT', message };
}

/**
 * 관리자 인증 쿠키와 백오피스 권한을 확인하고 액세스 토큰을 반환합니다.
 * @returns 인증된 액세스 토큰 또는 인증 / 권한 오류
 */
async function requireBackofficeAccessToken(): Promise<ApiResult<string>> {
  const { accessToken, role } = await getServerAuthTokens();
  if (!accessToken) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다. 다시 로그인해주세요.',
    };
  }
  if (!isBackofficeRole(role)) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '부스 관리 권한이 없습니다.',
    };
  }
  return { ok: true, data: accessToken };
}

/**
 * 부스 식별자를 안전한 비음수 정수로 검증합니다.
 * @param boothId 검증할 부스 식별자
 * @returns 유효한 부스 식별자 또는 입력 오류
 */
export function validateBoothId(boothId: unknown): ApiResult<number> {
  const id =
    typeof boothId === 'number'
      ? boothId
      : typeof boothId === 'string' && /^\d+$/.test(boothId)
        ? Number(boothId)
        : NaN;
  if (!Number.isSafeInteger(id) || id < 0) {
    return invalidBoothInput('유효하지 않은 부스 식별자입니다.');
  }
  return { ok: true, data: id };
}

/**
 * 부스에 배정된 프로젝트 응답 객체가 Swagger 계약에 맞는지 확인합니다.
 * @param value 검증할 프로젝트 응답 값
 * @returns 유효한 프로젝트 응답 여부
 */
function isValidBoothProject(value: unknown): value is BoothProjectResponse {
  if (value === null || typeof value !== 'object') return false;
  const project = value as Record<string, unknown>;
  return (
    typeof project.projectId === 'number' &&
    Number.isSafeInteger(project.projectId) &&
    project.projectId >= 0 &&
    typeof project.teamNumber === 'number' &&
    Number.isSafeInteger(project.teamNumber) &&
    project.teamNumber >= 0 &&
    typeof project.teamName === 'string' &&
    typeof project.title === 'string'
  );
}

/**
 * 개별 부스 응답 객체가 Swagger 계약에 맞는지 확인합니다.
 * @param value 검증할 부스 응답 값
 * @returns 유효한 부스 응답 여부
 */
function isValidBoothResponseItem(value: unknown): value is BoothResponseItem {
  if (value === null || typeof value !== 'object') return false;
  const booth = value as Record<string, unknown>;
  return (
    typeof booth.boothId === 'number' &&
    Number.isSafeInteger(booth.boothId) &&
    booth.boothId >= 0 &&
    typeof booth.boothNumber === 'number' &&
    Number.isSafeInteger(booth.boothNumber) &&
    booth.boothNumber >= 0 &&
    (typeof booth.location === 'string' || booth.location === null) &&
    (booth.project === null || isValidBoothProject(booth.project))
  );
}

/**
 * 호실 응답 객체가 Swagger 계약에 맞는지 확인합니다.
 * @param value 검증할 호실 응답 값
 * @returns 유효한 호실 응답 여부
 */
function isValidBoothRoomResponseItem(value: unknown): value is BoothRoomResponseItem {
  if (value === null || typeof value !== 'object') return false;
  const room = value as Record<string, unknown>;
  const hasValidRoomNumber =
    (typeof room.roomNumber === 'string' && room.roomNumber.trim().length > 0) ||
    (typeof room.roomNumber === 'number' &&
      Number.isSafeInteger(room.roomNumber) &&
      room.roomNumber >= 0);

  return (
    hasValidRoomNumber && Array.isArray(room.booths) && room.booths.every(isValidBoothResponseItem)
  );
}

/**
 * 구역 응답 객체가 Swagger 계약에 맞는지 확인합니다.
 * @param value 검증할 구역 응답 값
 * @returns 유효한 구역 응답 여부
 */
function isValidBoothZoneResponseItem(value: unknown): value is BoothZoneResponseItem {
  if (value === null || typeof value !== 'object') return false;
  const zone = value as Record<string, unknown>;
  return (
    isBoothApiZone(zone.zone) &&
    typeof zone.assignedCount === 'number' &&
    Number.isSafeInteger(zone.assignedCount) &&
    zone.assignedCount >= 0 &&
    typeof zone.totalCount === 'number' &&
    Number.isSafeInteger(zone.totalCount) &&
    zone.totalCount >= 0 &&
    Array.isArray(zone.rooms) &&
    zone.rooms.every(isValidBoothRoomResponseItem)
  );
}

/**
 * 서버의 부스 응답 항목을 화면 모델로 변환합니다.
 * @param booth 서버 부스 응답 항목
 * @returns 화면 표시용 부스 모델
 */
function toBoothItem(booth: BoothResponseItem): BoothItem {
  return {
    id: String(booth.boothId),
    boothId: booth.boothId,
    boothNumber: formatTwoDigitNumber(booth.boothNumber),
    location: booth.location,
    ...(booth.project
      ? {
          projectId: booth.project.projectId,
          teamNumber: formatTwoDigitNumber(booth.project.teamNumber),
          teamName: booth.project.teamName,
          projectName: booth.project.title,
        }
      : {}),
  };
}

/**
 * 서버의 구역 응답 항목을 화면 모델로 변환합니다.
 * @param zoneResponse 서버 구역 응답 항목
 * @returns 화면 표시용 구역 모델
 */
function toBoothZone(zoneResponse: BoothZoneResponseItem): BoothZone {
  const metadata = METADATA_BY_API_ZONE.get(zoneResponse.zone)!;

  /**
   * 호실 응답 항목을 화면용 호실 모델로 변환합니다.
   * @param roomResponse 서버 호실 응답 항목
   * @param roomIndex 구역 내 호실 순번
   * @returns 화면 표시용 호실 모델
   */
  function toBoothRoom(roomResponse: BoothRoomResponseItem, roomIndex: number): BoothRoom {
    const normalizedRoomNumber =
      typeof roomResponse.roomNumber === 'string'
        ? roomResponse.roomNumber.trim()
        : roomResponse.roomNumber;

    return {
      id: `${metadata.id}-${roomIndex}-${String(normalizedRoomNumber)}`,
      roomNumber: normalizedRoomNumber,
      name: formatRoomName(roomResponse.roomNumber),
      booths: roomResponse.booths.map(toBoothItem),
    };
  }

  return {
    id: metadata.id,
    apiZone: metadata.apiZone,
    label: metadata.label,
    assignedCount: zoneResponse.assignedCount,
    totalCount: zoneResponse.totalCount,
    rooms: zoneResponse.rooms.map(toBoothRoom),
  };
}

/**
 * 서버의 부스 현황 응답 형식을 검증하고 화면용 구역 목록으로 변환합니다.
 * @param payload 서버 성공 응답 래퍼
 * @returns 검증된 구역 목록 또는 형식 오류 결과
 */
export function validateBoothListResponse(
  payload: ApiSuccessResponse<BoothZoneResponseItem[]> | null,
): ApiResult<BoothZone[]> {
  if (!Array.isArray(payload?.data) || !payload.data.every(isValidBoothZoneResponseItem)) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '부스 현황 응답 형식이 올바르지 않습니다.',
    };
  }

  return {
    ok: true,
    data: payload.data.map(toBoothZone),
  };
}

/**
 * 인증 토큰으로 백오피스 부스 현황 조회 API를 호출합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param zone 선택적 구역 필터 (생략 시 전체 구역 조회)
 * @returns 구역별 부스 현황 목록 또는 API 오류
 */
export function requestBoothList(
  accessToken: string,
  zone?: BoothApiZone,
): Promise<ApiResult<BoothZone[]>> {
  const params = new URLSearchParams();
  if (zone) {
    params.set('zone', zone);
  }
  const search = params.toString();

  return requestServerApi<BoothZone[], ApiErrorCode, BoothZoneResponseItem[]>(
    `/backoffice/api/v1/booths${search ? `?${search}` : ''}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateBoothListResponse,
  );
}

/**
 * 관리자 인증 쿠키와 권한을 확인하고 부스 현황 목록을 조회합니다.
 * @param zone 선택적 구역 필터 (생략 시 전체 구역 조회)
 * @returns 구역별 부스 현황 목록 또는 인증 / 권한 오류
 */
export async function getBoothList(zone?: BoothApiZone): Promise<ApiResult<BoothZone[]>> {
  const auth = await requireBackofficeAccessToken();
  if (!auth.ok) return auth;

  return requestBoothList(auth.data, zone);
}

/**
 * 서버의 배정 가능 프로젝트 응답 항목을 검증하고 화면 모델로 변환합니다.
 * @param value 검증할 프로젝트 응답 항목
 * @returns 변환된 배정 가능 프로젝트 모델 또는 형식 불일치 시 null
 */
function parseAssignableProjectResponseItem(value: unknown): AssignableProjectItem | null {
  if (value === null || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const projectId = typeof item.projectId === 'number' ? item.projectId : item.id;
  const projectName =
    typeof item.title === 'string'
      ? item.title
      : typeof item.projectName === 'string'
        ? item.projectName
        : '';

  if (
    typeof projectId !== 'number' ||
    !Number.isSafeInteger(projectId) ||
    projectId < 0 ||
    typeof item.teamNumber !== 'number' ||
    !Number.isSafeInteger(item.teamNumber) ||
    item.teamNumber < 0 ||
    typeof item.teamName !== 'string'
  ) {
    return null;
  }

  return {
    projectId,
    teamNumber: formatTwoDigitNumber(item.teamNumber),
    teamName: item.teamName,
    projectName,
  };
}

/**
 * 서버의 배정 가능 프로젝트 목록 응답을 검증하고 화면 모델 배열로 변환합니다.
 * @param payload 서버 성공 응답 래퍼
 * @returns 검증된 배정 가능 프로젝트 목록 또는 형식 오류 결과
 */
export function validateAssignableProjectsResponse(
  payload: ApiSuccessResponse<unknown[]> | null,
): ApiResult<AssignableProjectItem[]> {
  if (!Array.isArray(payload?.data)) {
    return {
      ok: false,
      status: 502,
      code: 'UNKNOWN_ERROR',
      message: '배정 가능한 팀 목록 응답 형식이 올바르지 않습니다.',
    };
  }

  const projects: AssignableProjectItem[] = [];
  for (const item of payload.data) {
    const parsed = parseAssignableProjectResponseItem(item);
    if (!parsed) {
      return {
        ok: false,
        status: 502,
        code: 'UNKNOWN_ERROR',
        message: '배정 가능한 팀 목록 응답 형식이 올바르지 않습니다.',
      };
    }
    projects.push(parsed);
  }

  return { ok: true, data: projects };
}

/**
 * 인증 토큰으로 특정 부스에 배정 가능한 프로젝트 목록을 조회합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param boothId 대상 부스 식별자
 * @returns 배정 가능 프로젝트 목록 또는 API 오류
 */
export function requestAssignableProjects(
  accessToken: string,
  boothId: number,
): Promise<ApiResult<AssignableProjectItem[]>> {
  const params = new URLSearchParams({ boothId: String(boothId) });
  return requestServerApi<AssignableProjectItem[], ApiErrorCode, unknown[]>(
    `/backoffice/api/v1/booths/assignable-projects?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    validateAssignableProjectsResponse,
  );
}

/**
 * 관리자 인증과 부스 식별자를 확인하고 배정 가능한 프로젝트 목록을 조회합니다.
 * @param boothId 대상 부스 식별자
 * @returns 배정 가능 프로젝트 목록 또는 인증 / 권한 / 입력 오류
 */
export async function getAssignableProjects(
  boothId: unknown,
): Promise<ApiResult<AssignableProjectItem[]>> {
  const auth = await requireBackofficeAccessToken();
  if (!auth.ok) return auth;

  const validatedId = validateBoothId(boothId);
  if (!validatedId.ok) return validatedId;

  return requestAssignableProjects(auth.data, validatedId.data);
}

/**
 * 팀 배정 요청 본문을 검증하고 정규화합니다.
 * @param payload 요청 본문
 * @returns 검증된 프로젝트 식별자 요청 객체 또는 입력 오류
 */
export function validateAssignBoothProjectInput(
  payload: unknown,
): ApiResult<AssignBoothProjectRequest> {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return invalidBoothInput('요청 본문 형식이 올바르지 않습니다.');
  }
  const value = payload as Record<string, unknown>;
  if (
    typeof value.projectId !== 'number' ||
    !Number.isSafeInteger(value.projectId) ||
    value.projectId < 0
  ) {
    return invalidBoothInput('배정할 팀을 선택해주세요.');
  }
  return { ok: true, data: { projectId: value.projectId } };
}

/**
 * 인증 토큰으로 부스에 팀(프로젝트)을 배정합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param boothId 대상 부스 식별자
 * @param body 배정 요청 본문
 * @returns 배정 결과 또는 API 오류
 */
export function requestAssignBoothProject(
  accessToken: string,
  boothId: number,
  body: AssignBoothProjectRequest,
): Promise<ApiResult<null>> {
  return requestServerApi<null>(
    `/backoffice/api/v1/booths/${encodeURIComponent(String(boothId))}/project`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
      responseType: 'empty',
    },
  );
}

/**
 * 관리자 인증과 입력을 확인하고 부스에 팀을 배정합니다.
 * @param boothId 대상 부스 식별자
 * @param payload 배정 요청 본문
 * @returns 배정 결과 또는 인증 / 권한 / 입력 오류
 */
export async function assignBoothProject(
  boothId: unknown,
  payload: unknown,
): Promise<ApiResult<null>> {
  const auth = await requireBackofficeAccessToken();
  if (!auth.ok) return auth;

  const validatedId = validateBoothId(boothId);
  if (!validatedId.ok) return validatedId;

  const validatedBody = validateAssignBoothProjectInput(payload);
  if (!validatedBody.ok) return validatedBody;

  return requestAssignBoothProject(auth.data, validatedId.data, validatedBody.data);
}

/**
 * 인증 토큰으로 부스의 팀 배정을 취소합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param boothId 대상 부스 식별자
 * @returns 배정 취소 결과 또는 API 오류
 */
export function requestUnassignBoothProject(
  accessToken: string,
  boothId: number,
): Promise<ApiResult<null>> {
  return requestServerApi<null>(
    `/backoffice/api/v1/booths/${encodeURIComponent(String(boothId))}/project`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'empty',
    },
  );
}

/**
 * 관리자 인증과 식별자를 확인하고 부스의 팀 배정을 취소합니다.
 * @param boothId 대상 부스 식별자
 * @returns 배정 취소 결과 또는 인증 / 권한 / 입력 오류
 */
export async function unassignBoothProject(boothId: unknown): Promise<ApiResult<null>> {
  const auth = await requireBackofficeAccessToken();
  if (!auth.ok) return auth;

  const validatedId = validateBoothId(boothId);
  if (!validatedId.ok) return validatedId;

  return requestUnassignBoothProject(auth.data, validatedId.data);
}

/**
 * 부스 전체 수정(PUT 교체) 요청 본문을 검증하고 모든 필드를 정규화합니다.
 * @param payload 수정 요청 본문
 * @returns 모든 필드가 포함된 정규화된 수정 요청 또는 입력 오류
 */
export function validateUpdateBoothInput(payload: unknown): ApiResult<UpdateBoothRequest> {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return invalidBoothInput('요청 본문 형식이 올바르지 않습니다.');
  }

  const value = payload as Record<string, unknown>;
  if (!isBoothApiZone(value.zone)) {
    return invalidBoothInput('유효한 구역을 선택해주세요.');
  }

  let roomNumber: string | number;
  if (typeof value.roomNumber === 'string' && value.roomNumber.trim().length > 0) {
    roomNumber = value.roomNumber.trim();
  } else if (
    typeof value.roomNumber === 'number' &&
    Number.isSafeInteger(value.roomNumber) &&
    value.roomNumber >= 0
  ) {
    roomNumber = value.roomNumber;
  } else {
    return invalidBoothInput('호수를 입력하거나 선택해주세요.');
  }

  if (
    typeof value.boothNumber !== 'number' ||
    !Number.isSafeInteger(value.boothNumber) ||
    value.boothNumber < 0
  ) {
    return invalidBoothInput('유효한 부스 번호를 입력해주세요.');
  }

  if (value.location !== null && typeof value.location !== 'string') {
    return invalidBoothInput('위치 정보 형식이 올바르지 않습니다.');
  }

  if (
    value.projectId !== null &&
    (typeof value.projectId !== 'number' ||
      !Number.isSafeInteger(value.projectId) ||
      value.projectId < 0)
  ) {
    return invalidBoothInput('배정할 팀 형식이 올바르지 않습니다.');
  }

  const normalizedLocation =
    typeof value.location === 'string' ? value.location.trim() || null : null;

  return {
    ok: true,
    data: {
      zone: value.zone,
      roomNumber,
      boothNumber: value.boothNumber,
      location: normalizedLocation,
      projectId: value.projectId,
    },
  };
}

/**
 * 인증 토큰으로 부스 전체 정보를 교체 수정합니다.
 * @param accessToken 서버 쿠키에서 읽은 액세스 토큰
 * @param boothId 대상 부스 식별자
 * @param body 모든 필드가 포함된 수정 요청 본문
 * @returns 수정 결과 또는 API 오류
 */
export function requestUpdateBooth(
  accessToken: string,
  boothId: number,
  body: UpdateBoothRequest,
): Promise<ApiResult<null>> {
  return requestServerApi<null>(
    `/backoffice/api/v1/booths/${encodeURIComponent(String(boothId))}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
      responseType: 'empty',
    },
  );
}

/**
 * 관리자 인증과 식별자 / 입력을 확인하고 부스 전체 정보를 교체 수정합니다.
 * @param boothId 대상 부스 식별자
 * @param payload 수정 요청 본문
 * @returns 수정 결과 또는 인증 / 권한 / 입력 오류
 */
export async function updateBooth(boothId: unknown, payload: unknown): Promise<ApiResult<null>> {
  const auth = await requireBackofficeAccessToken();
  if (!auth.ok) return auth;

  const validatedId = validateBoothId(boothId);
  if (!validatedId.ok) return validatedId;

  const validatedBody = validateUpdateBoothInput(payload);
  if (!validatedBody.ok) return validatedBody;

  return requestUpdateBooth(auth.data, validatedId.data, validatedBody.data);
}
