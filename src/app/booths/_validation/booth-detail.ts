import { z } from 'zod';

/**
 * 부스 번호 문자열이 안전한 비음수 정수인지 검사합니다.
 * @param value 공백이 제거된 부스 번호 문자열
 * @returns 안전한 비음수 정수 여부
 */
function isValidSafeBoothNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0;
}

/**
 * 선택된 프로젝트 식별자 문자열이 비어 있거나 안전한 비음수 정수인지 검사합니다.
 * @param value 선택된 프로젝트 식별자 문자열
 * @returns 미선택 또는 유효한 프로젝트 식별자 여부
 */
function isValidOptionalProjectId(value: string): boolean {
  if (!value) return true;
  if (!/^\d+$/.test(value)) return false;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0;
}

/** 부스 상세 수정 및 팀 배정 폼의 입력 검증 스키마입니다. */
export const boothDetailSchema = z.object({
  zone: z.enum(['ZONE1', 'ZONE2', 'ZONE3'], { error: '유효한 구역을 선택해주세요.' }),
  roomValue: z.string().trim().min(1, '호수를 입력하거나 선택해주세요.'),
  boothNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, '부스 번호는 숫자로 입력해주세요.')
    .refine(isValidSafeBoothNumber, '유효한 부스 번호를 입력해주세요.'),
  location: z.string(),
  projectId: z.string().refine(isValidOptionalProjectId, '유효한 팀을 선택해주세요.'),
});

/** 부스 상세 수정 및 팀 배정 폼의 필드 값 타입입니다. */
export type BoothDetailFormValues = z.infer<typeof boothDetailSchema>;
