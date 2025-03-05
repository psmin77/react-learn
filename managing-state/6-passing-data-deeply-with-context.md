# Context를 사용해 데이터 깊게 전달하기

- 일반적으로 부모 컴포넌트에서 자식 컴포넌트로 props를 통해 데이터를 전달함
- Context는 부모 컴포넌트의 트리 아래에 있는 모든 컴포넌트들이 데이터를 전달받을 수 있는 방법

## Props 전달하기의 문제점

- Props는 UI 트리를 통해 명시적으로 컴포넌트 데이터를 전달하는 방법
- 트리에서 많은 컴포넌트를 거쳐야 하거나 다수의 컴포넌트에서 사용할 경우 번거롭고 불편해짐 → **Prop drilling**

## Context: Props의 대안

- Context는 부모 컴포넌트가 전체 하위 트리에 데이터를 제공할 수 있음
- 자식 컴포넌트가 트리 위 어딘가에 있는 데이터를 “요청”하는 방법
  1. Context 생성
  2. 데이터가 필요한 컴포넌트에서 context 사용 → `Heading`
  3. 데이터를 지정하는 컴포넌트에서 context 제공 → `Section`

## 1단계: Context 생성하기

- context를 만들고 컴포넌트에서 사용할 수 있도록 export
- `createContext`의 유일한 인자는 기본값

```jsx
import { createContext } from "react";

export const LevelContext = createContext(1);
```

## 2단계: Context 사용하기

- Context를 사용할 자식 컴포넌트에서 설정
- React의 `useContext` Hook과 생성한 Context를 가져옴
- prop 대신 `LevelContext` 데이터로 변경하여 값을 읽도록 함
  - `useContext`는 React에게 해당 컴포넌트가 context를 읽는다는 것을 알려줌

```jsx
export default function Heading({ children }) {
  const level = useContext(LevelContext);
  // ...
}

<Section level={4}>
  <Heading>Sub-sub-heading</Heading>
  <Heading>Sub-sub-heading</Heading>
  <Heading>Sub-sub-heading</Heading>
</Section>;
```

## 3단계: Context 제공하기

- Context를 제공할 부모 컴포넌트에서 설정
- 제공할 자식 컴포넌트를 **context provider**로 감싸줌
  - React에게 하위의 어떠한 컴포넌트가 context를 요구하면 value를 제공하라고 알려줌

```jsx
import { LevelContext } from "./LevelContext.js";

function Section({ level, children }) {
  return (
    <section className="section">
      <LevelContext.Provider value={level}>{children}</LevelContext.Provider>
    </section>
  );
}

export default function Page() {
  return (
    <Section level={1}>
      <Heading>Title</Heading>
      <Section level={2}>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section level={3}>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Section level={4}>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

## 같은 컴포넌트에서 context를 사용하며 제공하기

- 기존 `value`를 통해 자동으로 다음 `value`를 아래로 전달할 수 있음

```jsx
function Section({ children }) {
  const level = useContext(LevelContext);
  return (
    <section className="section">
      // 이전 값으로 다음 값을 전달
      <LevelContext.Provider value={level + 1}>
        {children}
      </LevelContext.Provider>
    </section>
  );
}

export default function Page() {
  // 전체 props 생략 가능
  return (
    <Section>
      <Heading>Title</Heading>
      <Section>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Section>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

## Context로 중간 컴포넌트 지나치기

- Context를 제공하는 컴포넌트와 사용하는 컴포넌트 사이에 원하는 만큼의 컴포넌트를 삽입할 수 있음
- Context를 사용하면 “주변에 적응”하고 렌더링 되는 위치에 따라 다르게 표시됨
- Context의 작동 방식 → CSS 속성 상속과 유사
  - div에 color를 지정하면 하위 DOM 노드가 별도 재정의하지 않으면 상위에 지정된 색상을 상속함
  - 서로 다른 React context는 영향을 주지 않음

## Context 사용하기 전 고려할 것

1. Props로 시작하기
   - 복잡하고 어려운 코드가 아니라면 props가 데이터 흐름이 명확하여 유지보수 용이함
2. 컴포넌트를 추출하고 JSX를 children으로 전달하기
   - `<Layout posts={posts} />` → `<Layout><Posts posts={posts} /></ Layout>`

## Context 사용 예시

- 테마 지정
- 현재 계정
- 라우팅
- 상태 관리

## 요약

- Context는 컴포넌트의 하위 트리 전체에 데이터를 제공할 수 있음
- 전달 방법
  - `export const MyContext = createContext(defaultValue)`
  - 사용할 컴포넌트(자식) → `useContext(MyContext)`
  - 제공할 컴포넌트(부모) → `<MyContext.Provider value={…}>`로 자식 컴포넌트 감싸기
- Context는 중간에 어떠한 컴포넌트도 지나갈 수 있음
- Context를 통해 주변에 적응하는 컴포넌트 가능
- Context를 사용하기 전에 props를 전달하거나 JSX를 children으로 전달하도록 먼저 시도
