'use server';

import { revalidatePath } from 'next/cache';

import { getServerAuthTokens } from '@/lib/auth/cookies';

import { updateUser } from '../api/update-user';
import { editSchema, type EditValues } from '../validation/user-edit';

type UpdateUserActionResult = { ok: true } | { ok: false; message: string };

/** 서버에서 권한과 입력값을 재확인한 뒤 사용자 정보를 수정합니다. */
export async function updateUserAction(
  userId: string,
  input: EditValues,
): Promise<UpdateUserActionResult> {
  const { accessToken, role } = await getServerAuthTokens();
  if (role !== 'SUPER_ADMIN') return { ok: false, message: '수정 권한이 없습니다.' };
  if (!accessToken) return { ok: false, message: '다시 로그인해 주세요.' };
  if (!/^[1-9]\d*$/.test(userId) || !Number.isSafeInteger(Number(userId))) {
    return { ok: false, message: '사용자 ID를 확인해 주세요.' };
  }

  const parsed = editSchema.safeParse(input);
  if (
    !parsed.success ||
    !Number.isSafeInteger(Number(parsed.data.teamNumber)) ||
    Number(parsed.data.teamNumber) <= 0
  ) {
    return { ok: false, message: '입력값을 확인해 주세요.' };
  }

  const result = await updateUser(userId, accessToken, parsed.data);
  if (!result.ok) {
    const message =
      result.status === 409
        ? '이미 사용 중인 아이디입니다.'
        : result.status === 400
          ? '입력값을 확인해 주세요.'
          : result.status === 401
            ? '로그인이 만료되었습니다. 다시 로그인해 주세요.'
            : result.status === 403
              ? '수정 권한이 없습니다.'
              : result.status === 404
                ? '사용자를 찾을 수 없습니다.'
                : '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    return { ok: false, message };
  }

  revalidatePath(`/users/${userId}`);
  return { ok: true };
}
