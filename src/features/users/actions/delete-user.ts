'use server';

import { getServerAuthTokens } from '@/lib/auth/cookies';

import { deleteUser } from '../api/delete-user';
import { getUserDetail } from '../api/get-user-detail';

type DeleteUserActionResult = { ok: true } | { ok: false; message: string };

/** 권한과 참여자 대상을 확인한 후에만 삭제합니다.
 * @param userId 삭제할 사용자 ID
 * @returns 삭제 성공 여부 또는 사용자에게 표시할 실패 메시지
 */
export async function deleteUserAction(userId: string): Promise<DeleteUserActionResult> {
  const { accessToken, role } = await getServerAuthTokens();
  if (role !== 'SUPER_ADMIN') return { ok: false, message: '삭제 권한이 없습니다.' };
  if (!accessToken) return { ok: false, message: '다시 로그인해 주세요.' };
  if (!/^[1-9]\d*$/.test(userId) || !Number.isSafeInteger(Number(userId))) {
    return { ok: false, message: '사용자 ID를 확인해 주세요.' };
  }

  const detail = await getUserDetail(userId, accessToken);
  if (!detail.ok) {
    return {
      ok: false,
      message:
        detail.status === 404 ? '참여자를 찾을 수 없습니다.' : '삭제 대상을 확인하지 못했습니다.',
    };
  }

  const result = await deleteUser(userId, accessToken);
  if (!result.ok) {
    const message =
      result.status === 401
        ? '로그인이 만료되었습니다. 다시 로그인해 주세요.'
        : result.status === 403
          ? '삭제 권한이 없습니다.'
          : result.status === 404
            ? '참여자를 찾을 수 없습니다.'
            : '삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    return { ok: false, message };
  }

  return { ok: true };
}
