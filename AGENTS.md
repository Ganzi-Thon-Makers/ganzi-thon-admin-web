<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git 워크플로우 및 컨벤션 지침

모든 AI 에이전트는 Git 작업 시 [Git 컨벤션 상세 가이드](docs/agent-guides/git-conventions.md)를 반드시 먼저 확인하고 준수해야 합니다.
(원문 출처: [Notion Git 컨벤션](https://app.notion.com/p/Git-412cf10cd2e780a4aceac385a55d4fae))

### 상황별 참조 가이드

| 작업 상황          | 필수 참조 위치                                                                          | 준수해야 할 핵심 지침                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **새 브랜치 생성** | [브랜치 컨벤션](docs/agent-guides/git-conventions.md#1-branch-convention-브랜치-컨벤션) | `<type>/<description>` 형식 사용 (소문자/하이픈). 기능 구현은 `feat`가 아니라 `feature/` 사용.                                                         |
| **커밋 작성**      | [커밋 컨벤션](docs/agent-guides/git-conventions.md#2-commit-convention-커밋-컨벤션)     | `<type>: <subject> #<issue-number>` 형식 사용. `feat` 타입 작성 시 "~기능 추가"가 아니라 반드시 "~기능 구현"으로 작성. 원문에 정의된 12종 타입만 사용. |
| **PR 생성**        | [PR 컨벤션](docs/agent-guides/git-conventions.md#3-pr-convention-pr-컨벤션)             | `<type>: <subject>` 형식 사용. 원문에 정의된 9종 타입만 사용.                                                                                          |

### 핵심 체크리스트

- **브랜치 네이밍**: 기능 브랜치는 `feature/<작업내용>` (예: `feature/oauth2`) 형식을 사용합니다.
- **커밋 제목**: `feat` 커밋 제목은 `~기능 구현` 형식을 준수합니다 (예: `feat: OAuth2 기능 구현 #1`).
- **이슈 번호**: 관련 이슈가 있을 경우 커밋 제목 끝에 ` #<이슈번호>`를 붙입니다.
- **규칙 임의 생성 금지**: 원문에 명시되지 않은 독자적 규칙이나 임의의 타입을 발명하지 않습니다.

## 코딩 컨벤션 지침 (Coding Conventions)

모든 AI 에이전트는 코드 작성 및 수정 시 [코딩 컨벤션 상세 가이드](docs/agent-guides/coding-conventions.md)를 준수해야 합니다. 공유 AI 스킬(`.agents/skills/`) 등 외부 문서 예시에서 `type Props`가 나오더라도, **본 프로젝트의 interface 및 함수 JSDoc 규칙이 항상 최우선**으로 적용됩니다.

### 상황별 참조 가이드

| 작업 상황                 | 필수 참조 위치                                         | 준수해야 할 핵심 지침                                                                                                                                            |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **컴포넌트 및 함수 작성** | [코딩 컨벤션](docs/agent-guides/coding-conventions.md) | 컴포넌트 Props는 반드시 interface 사용 (type alias 지양). 유틸 함수 및 컴포넌트 내부 작성 모든 함수/콜백(단순 인라인 콜백도 명명 함수로 분리)에 JSDoc 필수 작성. |

### 핵심 체크리스트

- **Props 인터페이스 우선 적용**: 컴포넌트 Props 정의 시 type alias 대신 반드시 `interface`를 사용합니다. (컴포넌트 Props에 한정되며, 유니온 타입이나 맵드 타입 등에는 `type` 사용이 가능합니다. 외부 스킬 예시보다 본 규칙이 우선합니다.)
- **함수 JSDoc 주석 의무화**: 공통/도메인 유틸 함수 및 컴포넌트 내부에 작성하는 모든 함수/콜백(함수 선언문, 함수 표현식, 화살표 함수, 이벤트 핸들러)에는 JSDoc 주석을 필수로 작성합니다.
- **인라인 콜백 분리**: JSX 내 단순 인라인 화살표 콜백도 규칙 대상이므로, 명명된 함수(예: `handleKeywordChange`)로 분리하여 JSDoc 주석(`@param` 포함)을 작성합니다.
- **JSDoc 작성 내용**: 목적/동작 요약, 매개변수(`@param`), 반환값(`@returns`)을 작성하며, TypeScript 타입 정보는 중복 기재하지 않습니다.
- **컴포넌트 함수 자체는 제외**: React 컴포넌트 함수 자체의 선언에는 별도 JSDoc 작성을 강제하지 않으며, 컴포넌트 내부 함수와 유틸 함수에 집중합니다.

## 공유 AI 스킬 지침 (Shared Agent Skills)

프로젝트 코드 품질과 일관된 아키텍처 설계를 위해 저장소에 공유된 로컬 스킬(`.agents/skills/`)을 우선 참조합니다. 상세한 팀원 안내는 [공유 스킬 가이드](docs/agent-guides/shared-skills.md)를 참고하세요.

### 작업 유형별 필수 참조 스킬

| 작업 유형                                   | 필수 참조 스킬 문서                                                                                        | 핵심 지침 및 준수 사항                                                                                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React / Next.js 구현, 리뷰, 성능 최적화** | [.agents/skills/vercel-react-best-practices/SKILL.md](.agents/skills/vercel-react-best-practices/SKILL.md) | Vercel의 React/Next.js 성능 최적화 규칙 준수. 프로젝트 합의 스택인 TanStack Query를 유지하며 SWR 등으로 변경하거나 불필요한 패키지를 설치하지 말 것. Next.js 16 로컬 docs 및 React 19 호환성 최우선. |
| **컴포넌트 API, 합성, Context 설계**        | [.agents/skills/vercel-composition-patterns/SKILL.md](.agents/skills/vercel-composition-patterns/SKILL.md) | 확장 가능한 컴포넌트 합성(Composition) 패턴 준수, Props 드릴링 방지, 단일 책임 원칙에 따른 Context 설계.                                                                                             |
