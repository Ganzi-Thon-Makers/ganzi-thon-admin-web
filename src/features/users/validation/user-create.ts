import { z } from 'zod';

/** 역할별 필수 입력과 형식을 검사하고 필드별 오류를 기록합니다.
 * @param values 등록 폼 입력값
 * @param context 필드별 오류를 기록하는 검증 문맥
 */
function validateCreateUser(
  values: {
    role: 'PARTICIPANT' | 'TEAM' | 'ADMIN';
    accountId: string;
    password: string;
    name: string;
    school: string;
    phoneNumber: string;
    teamNumber: string;
    part: string;
  },
  context: z.RefinementCtx,
) {
  const required =
    values.role === 'PARTICIPANT'
      ? (['name', 'school', 'phoneNumber', 'teamNumber', 'part'] as const)
      : values.role === 'TEAM'
        ? (['teamNumber'] as const)
        : (['name', 'school', 'phoneNumber'] as const);
  for (const field of required) {
    if (!values[field].trim())
      context.addIssue({ code: 'custom', path: [field], message: '필수 입력 항목입니다.' });
  }
  if (
    values.role !== 'TEAM' &&
    values.phoneNumber.trim() &&
    !/^010-\d{4}-\d{4}$/.test(values.phoneNumber)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['phoneNumber'],
      message: '010-1234-5678 형식으로 입력해 주세요.',
    });
  }
  if (
    values.role !== 'ADMIN' &&
    values.teamNumber &&
    (!/^\d+$/.test(values.teamNumber) ||
      Number(values.teamNumber) < 1 ||
      Number(values.teamNumber) > 30)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['teamNumber'],
      message: '1~30팀을 선택해 주세요.',
    });
  }
  if (
    values.role !== 'TEAM' &&
    values.part &&
    !['PLAN', 'DESIGN', 'WEB', 'APP', 'SERVER'].includes(values.part)
  ) {
    context.addIssue({ code: 'custom', path: ['part'], message: '파트를 선택해 주세요.' });
  }
}

export const createSchema = z
  .object({
    role: z.enum(['PARTICIPANT', 'TEAM', 'ADMIN']),
    accountId: z
      .string()
      .regex(/^[A-Za-z0-9_]{1,50}$/, '아이디는 1~50자의 영문, 숫자, _만 사용할 수 있습니다.'),
    password: z
      .string()
      .regex(/^[!-~]{1,72}$/, '비밀번호는 1~72자의 영문, 숫자, 특수문자로 입력해 주세요.'),
    name: z.string(),
    school: z.string(),
    phoneNumber: z.string(),
    teamNumber: z.string(),
    part: z.string(),
  })
  .superRefine(validateCreateUser);

export type CreateValues = z.infer<typeof createSchema>;
