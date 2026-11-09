// Storybook Flat Config 가이드: https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  // Next.js 핵심 웹 지표(Core Web Vitals) 검사 프리셋
  // 성능 최적화 / React Hook 규칙 / 웹 접근성 규칙 등 전반적인 코드 품질을 검사합니다.
  ...nextVitals,

  // TypeScript 전용 린트 규칙 프리셋
  // Next.js 환경의 TypeScript 권장 린트 규칙을 제공하며, tsc 타입 검사 자체를 대체하지는 않습니다.
  ...nextTs,

  // import / export 문 자동 정렬 규칙
  // 일관된 import 순서를 강제하여 가독성을 높이고 git diff 충돌을 줄입니다.
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // 전역 린트 제외 대상 설정
  // 프레임워크 빌드 결과물 / Storybook 정적 빌드 / 자동 생성 파일 등 검사가 불필요한 대상을 제외합니다.
  globalIgnores([
    // Next.js 프레임워크 빌드 및 캐시 디렉터리 제외
    '.next/**',
    // 정적 내보내기(SSG) 결과물 디렉터리 제외
    'out/**',
    // 일반 프로덕션 빌드 산출물 디렉터리 제외
    'build/**',
    // Storybook 정적 빌드 산출물 디렉터리 제외
    'storybook-static/**',
    // Next.js가 자동으로 생성 / 갱신하는 타입 선언 파일 제외
    'next-env.d.ts',
  ]),

  // Prettier와의 충돌 방지 설정
  // ESLint의 포맷팅 관련 규칙을 비활성화하여 Prettier의 서식 스타일과 충돌하지 않도록 합니다.
  eslintConfigPrettier,

  // Storybook 권장 린트 규칙 프리셋
  // 스토리북 작성 표준 준수 / 모범 사례 / CSF(Component Story Format) 규칙을 검사합니다.
  ...storybook.configs['flat/recommended'],
]);

export default eslintConfig;
