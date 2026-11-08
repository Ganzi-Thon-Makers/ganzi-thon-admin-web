# 코딩 컨벤션 가이드 (Coding Conventions)

프로젝트 코드의 가독성, 유지보수성, 일관된 아키텍처를 유지하기 위해 준수해야 하는 코딩 규칙입니다.

---

## 1. 컴포넌트 Props 정의 규칙 (Interface 사용)

### 규칙

- React 컴포넌트의 Props 타입을 정의할 때는 `type` 키워드(Type Alias) 대신 반드시 **`interface`**를 사용합니다.
- 공유 AI 스킬(`.agents/skills/`) 등 외부 문서 예시에서 `type Props = { ... }` 형태가 등장하더라도, **본 프로젝트의 interface 규칙이 항상 최우선**으로 적용됩니다.

### 적용 범위 및 주의사항

- **컴포넌트 Props 한정**: 본 규칙은 React 컴포넌트의 Props 정의에 한정됩니다.
- **Type Alias 사용 허용**: 유니온 타입(`type Status = 'idle' | 'loading'`), 튜플, 맵드 타입, 기타 복합 유틸리티 타입 등은 프로젝트 전반에서 `type` 키워드를 정상적으로 사용할 수 있습니다. (모든 `type` 사용을 금지하는 것이 아닙니다.)

### 코드 예시

```tsx
// 올바른 예시: 컴포넌트 Props는 interface로 정의
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  label: string;
  onClick: () => void;
}

export function Button({ variant = 'primary', label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

```ts
// 잘못된 예시: 컴포넌트 Props에 type alias 사용 금지
type ButtonProps = {
  label: string;
};
```

---

## 2. 함수 JSDoc 주석 작성 규칙

### 필수 작성 대상

1. **공통 및 도메인 유틸 함수** (`src/lib/`, `src/utils/` 등)
2. **컴포넌트 내부에 새로 작성하는 모든 함수 및 콜백** (이벤트 핸들러, 헬퍼 함수, 데이터 가공 함수 등)
   - 함수 선언문, 함수 표현식, 화살표 함수 등 작성 방식에 관계없이 모두 적용됩니다.
   - JSX 내 단순 인라인 화살표 함수(예: `onChange={(e) => ...}`)도 JSDoc이 없으면 규칙 위반이므로, 예외 없이 명명된 핸들러 함수로 추출하고 JSDoc 주석을 작성합니다.

### 의무 작성 제외 대상

- **컴포넌트 자체의 함수 선언**(예: `function Button(...)`, `export default function Page(...)`)은 본 규칙의 별도 JSDoc 의무 작성 대상이 아닙니다. (내부 함수와 범위를 명확히 구분합니다.)

### JSDoc 작성 지침

- **목적 및 동작 설명**: 함수가 수행하는 역할과 비즈니스 로직을 간결히 기술합니다.
- **매개변수 설명 (`@param`)**: 매개변수가 있는 경우 각 파라미터의 역할을 설명합니다.
- **반환값 설명 (`@returns`)**: 반환값이 있는 경우 반환되는 데이터의 의미를 기술합니다.
- **TS 타입 중복 불필요**: TypeScript 타입 시스템이 이미 타입을 보장하므로, `@param {string} name`처럼 중괄호 타입을 중복해서 적지 않고 `@param name 설명` 형식으로 작성합니다.

### 코드 예시

```ts
// 1. 유틸 함수 JSDoc 예시
/**
 * 숫자를 한국 원화(KRW) 통화 표기 형식으로 변환합니다.
 * @param amount 포맷팅할 금액 숫자
 * @returns 쉼표가 적용된 통화 문자열 (예: "10,000")
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR');
}
```

```tsx
// 2. 컴포넌트 내부 함수 JSDoc 예시
import { useState } from 'react';

interface SearchFormProps {
  initialKeyword?: string;
  onSearch: (keyword: string) => void;
}

export function SearchForm({ initialKeyword = '', onSearch }: SearchFormProps) {
  const [keyword, setKeyword] = useState(initialKeyword);

  /**
   * 키워드 입력 필드 변경 이벤트를 처리하고 상태를 갱신합니다.
   * @param event 입력 필드 변경 이벤트 객체
   */
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  /**
   * 폼 제출 이벤트를 가로채고 상위 컴포넌트로 공백이 제거된 검색어를 전달합니다.
   * @param event 폼 제출 이벤트 객체
   */
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input value={keyword} onChange={handleKeywordChange} />
      <button type="submit">검색</button>
    </form>
  );
}
```
