# 공유 AI 스킬 운영 및 활용 가이드 (Shared Agent Skills)

프로젝트 코드의 품질, 일관된 컴포넌트 설계, 성능 최적화를 위해 저장소 레벨에서 공유되는 로컬 AI 스킬(`.agents/skills/`)의 운영 및 활용 지침입니다.

---

## 1. 개요 및 저장소 완결형 스킬 공유 방식

- **개인 로컬 설치 불필요 (저장소 자체 완결)**: 팀원의 개인 환경에 별도의 전역 스킬이 설치되어 있지 않더라도, 모든 공유 스킬이 저장소(`.agents/skills/`) 내에 포함되어 저장소 자체로 완결됩니다. 저장소를 clone하거나 pull하면 즉시 사용 가능합니다.
- **Git 기반 단일 소스 관리**: 스킬 파일의 중복 없이 `.agents/skills/` 디렉터리를 프로젝트의 단일 소스(Single Source of Truth)로 관리합니다. 팀원 간 공유를 위해 해당 디렉터리가 Git에 커밋 및 푸시되어 관리됩니다.
- **공식 CLI 및 Lockfile 관리**:
  - 관리 도구: npm registry 패키지 `skills@1.7.6`
  - 프로젝트 Lockfile: 저장소 루트의 `skills-lock.json`
  - 설치 경로: `.agents/skills/vercel-react-best-practices`, `.agents/skills/vercel-composition-patterns`
  - 출처(Source): `vercel-labs/agent-skills`
  - 고정 Revision: `063bee94c3f4df8453406c830b0a7df0f2860278` (공식 태그: `agent-skills-063bee94c3f4df8453406c830b0a7df0f2860278`)
  - 검증된 Tree Hash:
    - `vercel-react-best-practices`: `343db72180d05814949fef7d46be96b5c6ee86b3`
    - `vercel-composition-patterns`: `bf90d0a4b83ea054653350f9c67f6de235d3a368`
  - Lock 동작 및 Hash 계산 특성:
    - CLI 구현 정보: `npm` 레지스트리 패키지 `skills@1.7.6` (gitHead: `7a5e920bead4b1039a6d6df5d7e1163b7b09423a`)의 `src/local-lock.ts:194-208`에 구현된 `computeSkillFolderHash` 함수로 project lock의 `computedHash`를 계산합니다.
    - 해시 계산 알고리즘: 대상 폴더 내 파일을 재귀 수집(`.git`, `node_modules` 제외)하고, `relativePath`를 `/`로 정규화하여 `localeCompare`로 정렬한 뒤, SHA-256에 각 `relativePath` 바이트와 파일 `content` 바이트를 구분자(delimiter) 없이 순차적으로 update합니다.
    - 소스 해시와 설치 폴더의 구분: `computedHash`는 `metadata.json`을 포함한 원본 스킬 소스(source) 폴더를 기준으로 계산한 해시입니다. copy 모드 설치본은 `metadata.json`이 제외되므로, source folder hash를 copy 설치 결과 폴더의 해시로 표기하거나 설치된 폴더의 직접 해시 검증용으로 간주해서는 안 됩니다.
    - skills.sh pack hash와의 구분: `src/skills-sh-hash.ts`의 `computeSkillsShTreeHash`는 skills.sh 패키지용 트리 해시이며, project lock의 `computedHash`와 완전히 별개의 해시입니다.
    - 무결성 재검증 결과: CLI frozen restore를 통한 재검증 결과, `frozen restore passed`, 프로젝트 스킬 파일과 복원본 간의 byte 완벽 일치(byte-identical), lockfile 미변경(unchanged), symlink 없음(none)이 확인되었습니다.
    - 최종 가이드 및 버전 관리는 각 `SKILL.md` frontmatter 메타데이터(`version: 1.0.0`)를 기준으로 합니다.
  - 설치 재현 명령:
    ```bash
    DO_NOT_TRACK=1 npm exec --yes --package=skills@1.7.6 -- skills add https://github.com/vercel-labs/agent-skills.git#063bee94c3f4df8453406c830b0a7df0f2860278 --skill vercel-react-best-practices vercel-composition-patterns --agent codex --copy --yes
    ```
    (실행 시 두 스킬이 `./.agents/skills/` 아래 copied로 기록되며, 저장소 루트에 `skills-lock.json`이 생성됩니다)
- **출처 및 라이선스 표기**:
  - 출처: [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
  - 저작자: Vercel, Inc. (`author: vercel`)
  - 라이선스: 별도의 라이선스 파일 없이 각 `SKILL.md` frontmatter에 선언된 `license: MIT` 기준입니다 (공식 license API 404 확인에 따라 별도 LICENSE 파일을 임의 생성하지 않음).
  - 상세 법적 고지: [제3자 스킬 라이선스 고지 문서](third-party-skills-notices.md)를 참고하세요.
- **빌드 불필요**: 원본 README에 포함된 build 안내는 upstream 개발자를 위한 빌드 절차이며, 프로젝트 팀원이 별도로 빌드 명령을 실행할 필요가 없습니다.

---

## 2. AI 도구별 동작 및 활용 방법

### Codex

- 저장소를 새로 clone하거나 pull하면 저장소 루트의 `.agents/skills/`를 자동으로 감지합니다.
- 작업 도중 스킬이 추가되었거나 스킬 목록에 즉시 나타나지 않는 경우, Codex 세션을 재시작(새 세션 시작)하면 정상적으로 인식됩니다.

### 기타 AI 도구 (Cursor, Claude Code, GitHub Copilot 등)

- 모든 AI 도구가 `.agents/skills` 디렉터리의 스킬 자동 발견을 지원하는 것은 아닙니다.
- 따라서 팀원이 다른 AI 도구를 사용할 때는 프로젝트 가이드라인인 [`AGENTS.md`](../../AGENTS.md)를 먼저 읽고, 필요한 스킬 파일을 직접 참조하도록 프롬프트로 지시해야 합니다.

### 💡 팀원을 위한 최초 작업 프롬프트 예시

다른 AI 도구나 새 세션을 시작할 때 아래와 같이 프롬프트를 입력하여 저장소의 스킬 문서를 참조하도록 안내할 수 있습니다:

```text
이 저장소의 AGENTS.md를 먼저 읽고, 작업 내용에 맞춰 .agents/skills/.../SKILL.md 문서를 참조하여 개발을 진행해주세요.
```

---

## 3. 공유 스킬 목록 및 참조 링크

| 스킬 명칭                     | 문서 상대 경로 (클릭 이동)                                            | 주요 적용 작업                                                             |
| ----------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `vercel-react-best-practices` | [SKILL.md](../../.agents/skills/vercel-react-best-practices/SKILL.md) | React / Next.js 기능 구현, 코드 리뷰, 렌더링 성능 최적화, 번들 최적화      |
| `vercel-composition-patterns` | [SKILL.md](../../.agents/skills/vercel-composition-patterns/SKILL.md) | 컴포넌트 API 설계, 합성(Composition) 패턴, Props 드릴링 방지, Context 설계 |

---

## 4. 기술 스택 준수 필수 주의사항

스킬 문서에 기술된 일반적인 권장 사항보다 **본 프로젝트에서 합의된 기술 스택과 가이드라인이 항상 우선**합니다:

1. **Next.js 16 및 React 19 로컬 규격 우선**:
   - Next.js 로컬 문서(`node_modules/next/dist/docs/`) 및 React 19의 표준/동작 방식을 최우선으로 준수합니다.
2. **데이터 패칭 스택 임의 변경 금지 (TanStack Query 유지)**:
   - 스킬 내에 SWR 관련 권장 사항이 포함되어 있더라도, 본 프로젝트의 공식 서버 상태 관리 라이브러리는 **TanStack Query (`@tanstack/react-query`)**입니다.
   - SWR로 무단 변경하거나 대체하지 않습니다.
3. **불필요한 패키지 자동 설치 금지**:
   - 스킬 문서의 예시에 등장하는 추가 유틸리티나 외부 패키지를 임의로 `pnpm add`하여 의존성을 늘리지 않습니다.
   - 프로젝트에 이미 설치된 표준 라이브러리 및 자체 구현을 우선 활용합니다.

---

## 5. 스킬 업데이트 절차

1. Upstream([vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills))의 최신 스킬 릴리즈 및 고정 ref 변경 사항 검토
2. 공식 CLI(`skills add` / update)를 통해 갱신 후 `skills-lock.json` 무결성 검증
3. 본 프로젝트의 Next.js 16 / React 19 및 TanStack Query 스택과의 호환성 확인
4. 변경 사항 검증(`pnpm lint`, `pnpm build`) 후 PR을 통해 main 브랜치에 머지
