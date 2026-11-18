/** 관리자 사용자 상세 화면에서 사용하는 사용자 정보입니다. */
export interface User {
  /** 목록 및 상세 경로에서 사용하는 사용자 식별자 */
  id: string;
  /** 사용자 이름 */
  name: string;
  /** 소속 학교 */
  school: string;
  /** 연락처 */
  phoneNumber: string;
  /** 럭키드로우 응모 여부 */
  hasEnteredLuckyDraw: boolean;
  /** 교육 수료 여부 */
  hasCompletedCourse: boolean;
  /** 소속 팀 번호 */
  teamNumber: string;
  /** 로그인 계정 ID */
  accountId: string;
  /** 참여 파트 */
  part: string;
}

/** 사용자 상세 화면의 표시 및 버튼 권한에 사용할 관리자 역할입니다. */
export type AdminRole = 'admin' | 'superadmin';
