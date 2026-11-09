# ganzi-thon-admin-web

2026 간지톤 운영진을 위한 어드민 웹 프론트엔드 프로젝트입니다.

---

## 🛠 기술 스택

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**: TanStack Query (`@tanstack/react-query`), Zustand
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, commitlint
- **Package Manager**: pnpm (v12.18.0 기준)

---

## 🚀 시작하기

### 1. 패키지 설치

본 프로젝트는 `pnpm` (v12.18.0) 패키지 매니저를 사용합니다.

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속하여 결과를 확인할 수 있습니다.

---

## 🧪 코드 품질 및 빌드 검사 명령

커밋 또는 PR 생성 전 로컬에서 아래 명령어로 코드 무결성을 검증할 수 있습니다:

```bash
# 린트 검사 (자동 수정: pnpm lint:fix)
pnpm lint

# 코드 포맷팅 스타일 검사 (자동 수정: pnpm format)
pnpm format:check

# Next.js 타입 생성 및 TypeScript 타입 검사
pnpm typecheck

# 프로덕션 빌드 검사
pnpm build
```

### Git Hook 자동 검사

Husky를 통해 커밋 실행 시 자동으로 코드 무결성과 메시지 규칙을 검증합니다:

- **`pre-commit`**: 스테이징된 파일 대상 `lint-staged` 실행 (린트 및 포맷팅 검사/자동 수정)
- **`commit-msg`**: 커밋 메시지 대상 `commitlint` 실행 (12종 허용 타입, `<type>: <subject>` 형식, 이슈 번호 끝자리 위치, `feat`의 '기능 추가' 차단 및 '기능 구현' 권장)

---

## 🔄 CI (Continuous Integration)

GitHub Actions 워크플로우(`.github/workflows/ci.yml`)를 통해 다음 이벤트 발생 시 자동으로 검사(린트 / 포맷팅 / 타입 검사 / 빌드)를 수행합니다:

- `main` 브랜치를 타겟으로 하는 Pull Request(PR) 생성 및 갱신 시
- `main` 브랜치에 코드가 push될 때
- GitHub Actions 탭에서 수동 실행(`workflow_dispatch`) 시

---

## 📚 팀 가이드 및 개발 지침

- [Git 컨벤션 가이드](docs/agent-guides/git-conventions.md): 브랜치 네이밍, 커밋 메시지, PR 작성 규칙 및 commitlint 자동 검사
- [코딩 컨벤션 가이드](docs/agent-guides/coding-conventions.md): 컴포넌트 Props interface 정의 및 함수 JSDoc 주석 규칙
- [공유 AI 스킬 가이드](docs/agent-guides/shared-skills.md): 로컬 AI 스킬(`.agents/skills/`) 운영 및 활용 지침
