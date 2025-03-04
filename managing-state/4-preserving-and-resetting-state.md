## State는 렌더트리의 위치에 연결

- React는 컴포넌트가 UI 렌더 트리에 있는 위치를 이용해 각 state를 컴포넌트와 연결함
- state는 컴포넌트 내부에 있는 것처럼 보이지만 React 안에 있음
- → 각각 트리에서 자기 고유의 위치에 렌더링되어 독립적으로 존재함

## 같은 자리의 같은 컴포넌트는 state 보존

- UI 트리 관점에서 같은 위치에 같은 컴포넌트와 state는 보존됨
- → DOM 요소에서 제거되지 않고 유지되어야 함
- 만약 if 조건문 등에서 동일한 위치에 동일한 컴포넌트를 return 한다면 유지됨

## 같은 위치의 다른 컴포넌트는 state 초기화

- 같은 위치에 다른 컴포넌트는 모든 컴포넌트와 state는 초기화
- DOM에서 제거될 때 전체 하위 트리도 제거됨
- 리렌더링 시 state를 유지하려면 트리 구조가 “같아야" 함
- NOTE) 컴포넌트를 중첩하지 않고 최상위 범위에서 정의해야 함

## 같은 위치에서 state 초기화

### 1. 다른 위치에서 컴포넌트 렌더링하기

- 각 컴포넌트의 state는 DOM에서 지워질 때마다 제거되므로 조건문을 통해 렌더링 여부 확인

```jsx
import { useState } from "react";

export default function Scoreboard() {
  const [isPlayerA, setIsPlayerA] = useState(true);
  return (
    <div>
      {isPlayerA && <Counter person="Taylor" />}
      {!isPlayerA && <Counter person="Sarah" />}
      <button
        onClick={() => {
          setIsPlayerA(!isPlayerA);
        }}
      >
        Next player!
      </button>
    </div>
  );
}
```

### 2. key를 이용해 state 초기화하기

- React가 컴포넌트를 구별하기 위해 부모 안에서의 순서를 key로 사용
  - `<Counter key="Taylor" person="Taylor" />`
  - `<Counter key="Sarah" person="Sarah" />`
- key의 범위는 전역이 아니라 부모 안에서만 사용

### 3. key를 이용해 폼을 초기화하기

- 폼 컴포넌트 자체에도 key를 사용하면 DOM 엘리먼트를 다시 생성하여 초기화 가능

## 요약

- React는 같은 컴포넌트가 같은 자리에 렌더링하면 state 유지
- state는 JSX를 만든 트리 위치와 연관됨
- 컴포넌트에 각 key를 할당하여 하위 트리를 초기화 가능
- 중첩 컴포넌트는 사용하지 말 것
