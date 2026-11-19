import { z } from 'zod';

const phonePattern = /^01[016789]-?\d{3,4}-?\d{4}$/;

/** 수정 폼과 서버 액션에서 동일하게 적용하는 입력 검증입니다. */
export const editSchema = z.object({
  name: z.string().trim().min(1, '필수 입력 항목입니다.'),
  school: z.string().trim().min(1, '필수 입력 항목입니다.'),
  phoneNumber: z.string().trim().regex(phonePattern, '전화번호 형식을 확인해 주세요.'),
  teamNumber: z.string().min(1, '팀을 선택해 주세요.'),
  accountId: z.string().trim().min(1, '필수 입력 항목입니다.'),
  password: z
    .string()
    .refine((value) => !value || value.trim().length > 0, '비밀번호를 확인해 주세요.'),
  part: z.string().min(1, '파트를 선택해 주세요.'),
});

export type EditValues = z.infer<typeof editSchema>;
