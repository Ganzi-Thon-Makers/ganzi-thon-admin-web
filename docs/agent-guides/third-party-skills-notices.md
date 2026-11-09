# 제3자 스킬 라이선스 및 저작권 고지 (Third-Party Skills Notices)

본 프로젝트의 저장소(`.agents/skills/`)에 포함된 외부 스킬에 대한 출처, 저작자 Attribution, 라이선스 선언, 고정 Revision 및 법적 고지 사항입니다.

---

## 1. 대상 스킬 및 확인된 메타데이터

- **포함된 스킬**:
  1. `vercel-react-best-practices`
     - `author`: `vercel`
     - `license`: `MIT`
     - `version`: `1.0.0`
     - Git Tree Hash: `343db72180d05814949fef7d46be96b5c6ee86b3`
  2. `vercel-composition-patterns`
     - `author`: `vercel`
     - `license`: `MIT`
     - `version`: `1.0.0`
     - Git Tree Hash: `bf90d0a4b83ea054653350f9c67f6de235d3a368`
- **저작자 (Attribution)**: Vercel, Inc. (`author: vercel`)
- **공식 출처 저장소**: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **고정 Revision (Provenance)**:
  - Commit SHA: `063bee94c3f4df8453406c830b0a7df0f2860278`
  - 공식 Tag: `agent-skills-063bee94c3f4df8453406c830b0a7df0f2860278`
  - 해당 commit의 공식 Git tree hash가 기존 global lock 제공값과 일치함을 확인하였습니다.

---

## 2. 라이선스 근거 및 사실 관계 명시

1. **라이선스 선언 근거**:
   - 각 스킬의 `SKILL.md` frontmatter에 `author: vercel` 및 `license: MIT` 선언이 확인되었습니다.
   - 공식 upstream 저장소([vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills))의 `README.md` 내 라이선스 섹션에 MIT License로 선언되어 있습니다.
2. **독립 LICENSE 파일 부재 및 미생성 사실**:
   - upstream 저장소 루트에는 별도의 독립된 `LICENSE` 파일이 존재하지 않습니다 (GitHub License API 기준 404 확인).
   - 따라서 원문에 없는 별도의 LICENSE 파일을 임의로 생성하지 않고, 본 고지 문서로 법적 사실을 명시합니다.
3. **CLI 도구 라이선스와의 구분**:
   - 스킬 설치 및 잠금 관리에 사용되는 공식 CLI 도구(`skills@1.7.6`)의 자체 라이선스는 도구 소프트웨어의 라이선스이며, 이를 스킬 콘텐츠 자체의 라이선스로 혼동하지 않아야 합니다.
4. **저작권 연도 및 권리자 표기 사실**:
   - upstream 저장소 원문에 별도의 `Copyright (c) <Year> <Holder>` 문구가 파일 형태로 제공되지 않으므로, 원문에 없는 임의의 연도나 권리자 텍스트를 허위로 발명하지 않고 공식 저작자인 Vercel에 대한 Attribution으로 유지합니다.

---

## 3. 표준 MIT 라이선스 전문 (Standard OSI MIT Permission Notice & Disclaimer)

각 스킬의 `license: MIT` 선언 및 upstream 선언에 근거하여 표준 MIT 라이선스의 허가 조건과 법적 면책 조항 전문을 아래와 같이 보존/고지합니다.

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
