import type { User } from '../types/user';

/** 사용자 상세 화면 및 API 대체 계층 검증에 사용할 목업 사용자입니다. */
export const mockUsers: User[] = [
  {
    id: 'test-user-001',
    name: '강민서',
    school: '한국대학교',
    phoneNumber: '010-0000-0001',
    hasEnteredLuckyDraw: true,
    hasCompletedCourse: true,
    teamNumber: '01',
    accountId: 'ganzithon01',
    part: '기획',
  },
];

/** 식별자로 목업 사용자 한 명을 조회합니다.
 * @param userId 상세 페이지 경로에 포함된 사용자 식별자
 * @returns 일치하는 사용자 또는 존재하지 않으면 undefined
 */
export function getMockUserById(userId: string): User | undefined {
  return mockUsers.find((user) => user.id === userId);
}
