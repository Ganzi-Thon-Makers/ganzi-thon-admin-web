'use server';

import { revalidatePath } from 'next/cache';

import { getServerAuthTokens } from '@/lib/auth/cookies';

import { createUser } from '../api/create-user';
import { createSchema, type CreateValues } from '../validation/user-create';

/** 관리자 권한과 입력값을 확인한 뒤 사용자 등록을 요청합니다.
 * @param input 등록 폼에서 전달한 입력값
 * @returns 등록 성공 여부 또는 실패 안내 메시지
 */
export async function createUserAction(
  input: CreateValues,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { accessToken, role } = await getServerAuthTokens();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { ok: false, message: '등록 권한이 없습니다.' };
  if (!accessToken) return { ok: false, message: '다시 로그인해 주세요.' };
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: '입력값을 확인해 주세요.' };
  const result = await createUser(accessToken, parsed.data);
  if (!result.ok) return { ok: false, message: result.message };
  if (parsed.data.role === 'PARTICIPANT') revalidatePath('/users');
  return { ok: true };
}
