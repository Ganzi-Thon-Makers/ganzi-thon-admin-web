/** @type {import("prettier").Config} */
const config = {
  // 줄바꿈을 시도하는 권장 기준 길이 (100자 기준 / 긴 문자열이나 정규식 등은 초과할 수 있는 유연한 기준)
  printWidth: 100,

  // 들여쓰기 공백 수 (2칸 스페이스 기준)
  tabWidth: 2,

  // 모든 문장 끝에 세미콜론(;) 유지
  semi: true,

  // 일반 JS / TS 코드의 문자열에 작은따옴표(') 사용
  singleQuote: true,

  // JSX 속성값에는 HTML 관례에 따라 큰따옴표(") 사용
  jsxSingleQuote: false,

  // 여러 줄로 작성된 객체 / 배열 / 함수 매개변수 등의 마지막 요소 뒤에 항상 쉼표 추가
  trailingComma: 'all',

  // 객체 리터럴 작성 시 중괄호 안쪽에 공백 유지 ({ foo: bar })
  bracketSpacing: true,

  // 화살표 함수의 매개변수가 1개일 때도 항상 괄호로 감싸기
  arrowParens: 'always',

  // 줄바꿈 문자로 LF(Unix / macOS / Linux 표준) 강제
  endOfLine: 'lf',

  // Prettier 플러그인 목록
  // Tailwind CSS 클래스를 공식 권장 순서대로 자동 정렬
  plugins: ['prettier-plugin-tailwindcss'],

  // Tailwind v4 설정 및 커스텀 유틸리티 클래스가 포함된 스타일시트 참조
  // 클래스 정렬 플러그인이 globals.css를 분석하여 프로젝트에 정의된 클래스 순서를 정확히 정렬하도록 지원
  tailwindStylesheet: './src/app/globals.css',
};

export default config;
