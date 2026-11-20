import { z } from 'zod';

export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
export const ALLOWED_THUMBNAIL_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const thumbnailSchema = z
  .custom<File | null>((value) => value === null || value instanceof File)
  .refine(
    (file) => !file || ALLOWED_THUMBNAIL_TYPES.includes(file.type),
    'JPG, PNG, WEBP 이미지만 선택할 수 있습니다.',
  )
  .refine((file) => !file || file.size <= MAX_THUMBNAIL_SIZE, '이미지는 5MB 이하여야 합니다.');

export const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '프로젝트명을 입력해 주세요.')
    .max(100, '100자 이하로 입력해 주세요.'),
  platform: z
    .enum(['WEB', 'APP'], { error: '서비스 유형을 선택해 주세요.' })
    .nullable()
    .refine(Boolean, '서비스 유형을 선택해 주세요.'),
  serviceUrl: z.string().max(500, '500자 이하로 입력해 주세요.'),
  teamNumber: z.number().int().min(1).max(30).nullable().refine(Boolean, '팀을 선택해 주세요.'),
  teamName: z
    .string()
    .trim()
    .min(1, '팀이름을 확인해 주세요.')
    .max(100, '100자 이하로 입력해 주세요.'),
  memberIds: z.array(z.number().int().positive()),
  techStack: z
    .string()
    .trim()
    .min(1, '기술 스택을 입력해 주세요.')
    .max(500, '500자 이하로 입력해 주세요.'),
  summary: z
    .string()
    .trim()
    .min(1, '한 줄 소개를 입력해 주세요.')
    .max(200, '200자 이하로 입력해 주세요.'),
  description: z.string().trim().min(1, '상세 설명을 입력해 주세요.'),
  thumbnail: thumbnailSchema,
});

/** 등록에서는 이미지를 필수로 검사하고 수정에서는 기존 이미지를 허용합니다.
 * @param mode 폼의 등록·수정 모드
 * @param hasExistingThumbnail 기존 대표 이미지의 존재 여부
 * @returns 모드별 검증 스키마
 */
export function getProjectFormSchema(mode: 'create' | 'edit', hasExistingThumbnail: boolean) {
  return projectFormSchema.refine(
    (values) => (mode === 'edit' && hasExistingThumbnail) || values.thumbnail !== null,
    { path: ['thumbnail'], message: '대표 이미지를 선택해 주세요.' },
  );
}

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export interface ProjectTeamOption {
  teamNumber: number;
  teamName: string;
  projectId: number;
}

export interface ProjectMemberOption {
  userId: number;
  name: string;
  loginId: string;
  role: 'PARTICIPANT' | 'TEAM';
  part: 'PLAN' | 'DESIGN' | 'WEB' | 'APP' | 'SERVER' | null;
  teamNumber: number | null;
  projectId: number | null | undefined;
}
