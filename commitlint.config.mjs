// 프로젝트 Git 커밋 메시지 컨벤션 검증 설정 (commitlint)
// - pre-commit 훅: 스테이징된 파일의 린트 및 포맷팅(lint-staged) 검사
// - commit-msg 훅: 작성된 커밋 메시지의 타입, 형식, 키워드 준수 여부 검사

/** 프로젝트 커밋 컨벤션에 정의된 12종 허용 커밋 타입 */
const types = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'comment',
  'design',
  'remove',
  'rename',
  'devops',
];

/** 커밋 제목 기본 형식 검증 정규식: "<type>: <subject>" */
const headerPattern = new RegExp(`^(?:${types.join('|')}): \\S(?:.*\\S)?$`, 'u');

/** 커밋 메시지 내 이슈 번호 참조 패턴 */
const issueReferencePattern = /(?:^|\s)#\d+/u;

/** 이슈 번호가 포함될 경우 반드시 제목 끝에 위치해야 하는 패턴: "<type>: <subject> #<양의 정수>" */
const issueSuffixPattern = new RegExp(`^(?:${types.join('|')}): \\S(?:.*\\S)? #[1-9]\\d*$`, 'u');

/** feat 타입에서 사용 금지된 '기능 추가' 표현 패턴 */
const featureAdditionPattern = /기능\s+추가/u;

/** feat 타입에서 권장되는 '기능 구현' 표현 패턴 */
const featureImplementationPattern = /기능\s+구현/u;

/**
 * 커밋 메시지 첫 줄(header)의 기본 형식과 이슈 번호 위치를 검증합니다.
 * - 기본 형식: "<type>: <subject>"
 * - 이슈 번호는 선택 사항이며, 포함될 경우 반드시 제목 끝에 " #<양의 정수>" 형식이어야 합니다.
 * @param parsed Commitlint가 파싱한 커밋 메시지 객체
 * @param parsed.header 커밋 메시지의 첫 번째 줄 전체 텍스트
 * @returns 검사 통과 여부와 실패 시 에러 메시지로 구성된 판정 튜플 [boolean, string]
 */
function validateHeaderFormat({ header }) {
  const value = header ?? '';

  if (!headerPattern.test(value)) {
    return [false, '제목은 "<type>: <subject>" 형식으로 작성해야 합니다.'];
  }

  if (issueReferencePattern.test(value) && !issueSuffixPattern.test(value)) {
    return [false, '이슈 번호는 제목 끝에 " #<양의 정수>" 형식으로 작성해야 합니다.'];
  }

  return [true, ''];
}

/**
 * feat 타입 커밋 메시지에 금지된 "기능 추가" 표현이 포함되어 있는지 검증합니다.
 * @param parsed Commitlint가 파싱한 커밋 메시지 객체
 * @param parsed.type 커밋 메시지 타입
 * @param parsed.subject 커밋 메시지 본문 제목
 * @returns 검사 통과 여부와 위반 시 에러 메시지로 구성된 판정 튜플 [boolean, string]
 */
function forbidFeatFeatureAddition({ type, subject }) {
  return [
    type !== 'feat' || !featureAdditionPattern.test(subject ?? ''),
    'feat 제목에는 "기능 추가" 표현을 사용할 수 없습니다.',
  ];
}

/**
 * feat 타입 커밋 메시지에 권장 표현인 "기능 구현"이 포함되어 있는지 검증합니다.
 * @param parsed Commitlint가 파싱한 커밋 메시지 객체
 * @param parsed.type 커밋 메시지 타입
 * @param parsed.subject 커밋 메시지 본문 제목
 * @returns 검사 통과 여부와 미준수 시 안내 메시지로 구성된 판정 튜플 [boolean, string]
 */
function recommendFeatFeatureImplementation({ type, subject }) {
  return [
    type !== 'feat' || featureImplementationPattern.test(subject ?? ''),
    'feat 제목에는 "기능 구현" 표현을 권장합니다.',
  ];
}

const config = {
  plugins: [
    {
      rules: {
        'header-format': validateHeaderFormat,
        'feat-feature-addition': forbidFeatFeatureAddition,
        'feat-feature-implementation': recommendFeatFeatureImplementation,
      },
    },
  ],
  // 룰 수준: 2 = error (커밋 차단), 1 = warning (경고 메시지 출력 후 커밋 허용)
  rules: {
    // 허용된 12종 커밋 타입만 사용 가능 (위반 시 커밋 차단)
    'type-enum': [2, 'always', types],
    // scope 사용 금지 (위반 시 커밋 차단)
    'scope-empty': [2, 'always'],
    // 제목 필수 작성 (위반 시 커밋 차단)
    'subject-empty': [2, 'never'],
    // 제목 형식 및 이슈 번호 끝자리 위치 검증 (위반 시 커밋 차단)
    'header-format': [2, 'always'],
    // feat 타입에 '기능 추가' 표현 사용 금지 (위반 시 커밋 차단)
    'feat-feature-addition': [2, 'always'],
    // feat 타입에 '기능 구현' 표현 권장 (미준수 시 경고 출력)
    'feat-feature-implementation': [1, 'always'],
  },
};

export default config;
