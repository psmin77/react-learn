## ref로 노드 가져오기

- DOM 노드에 접근하기 위해 `useRef` Hook 호출
- 노드를 가져오려는 JSX tag에 `ref` 어트리뷰트 전달
- `useRef` Hook은 `current` 라는 단일 속성을 가진 객체 반환 → DOM 노드를 이벤트 핸들러에서 접근하거나 노드에 정의된 내장 브라우저 API 사용 가능

```jsx
import { useRef } from 'react';

const myRef = useRef(null);

<div ref={myRef}>

// 브라우저 API 사용
myRef.current.scrollIntoView();
```

### 예시: 텍스트 입력 포커스 이동

```jsx
import { useRef } from 'react';

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  );
}
```

- 일반적으로 ref는 DOM 조작하는 경우 사용됨
- `setTimeout` TimerID와 같은 React 외부 요소를 저장하는 용도로도 사용 → 렌더링 시에도 데이터를 유지하고 리렌더 트리거하지 않음

### 예시: 특정 요소로 스크롤 이동

- 브라우저의 `scrollIntoView()` 메서드를 사용하여 이미지를 중앙에 배치할 수 있음

### ref 콜백을 사용하여 ref 리스트 관리하기

- Hook은 컴포넌트 최상단에서만 호출되어야 하므로, 반복문 또는 조건문이나 `map()` 내부에서 호출 불가
- `ref` 어트리뷰트에 함수 전달할 수 있음 → `ref` 콜백

## 다른 컴포넌트의 DOM 노드 접근하기

- 사용자 정의 함수에서는 `ref`를 prop 처럼 전달 가능
    - ex. `MyForm` → `MyInput` → `input` → `inputRef.current` 사용 가능
- NOTE) 보안 등을 고려하여 하위 API를 제한적으로 노출할 수 있음

```jsx
  useImperativeHandle(ref, () => ({
    // 오직 focus만 노출합니다.
    focus() {
      realInputRef.current.focus();
    },
  }));
```

## React가 ref를 부여할 때

- React의 갱신 두 단계
    1. 렌더링 단계에서 React는 화면에 그려야하는 컴포넌트 호출
    2. 커밋 단계에서 React는 변경사항을 DOM에 적용 → `ref.current` 설정
- 일반적으로 렌더링 단계에서 `ref(null)`에 접근 불가
- 대부분 `ref` 접근은 이벤트 핸들러에서 발생

## ref로 DOM을 조작하는 모범 사례

- Ref는 탈출구 → “React에서 벗어나야 할 때” 사용
    - 포커스 혹은 스크롤을 조작하거나 브라우저 API 호출 등
- 단, 직접 DOM 조작으로 인해 React와의 충돌 발생 위험
    - React가 관리하는 DOM 노드를 직접 조작하는 경우 충분히 고려해야 함

## 요약

- Ref는 일반적으로 DOM 요소를 참조하기 위해 사용
- DOM 요소에 바인딩하여 `myRef.current = DOM NODE` 주입
- ref는 포커싱, 스크롤링, DOM 요소 크기 또는 위치 변경 등으로 사용되기도 함
- React가 관리하는 DOM 노드를 직접 수정하지 말 것, 또는 React가 관여하지 않는 부분만 허용