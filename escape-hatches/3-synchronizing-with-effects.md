## Effect란 무엇이고 이벤트와는 어떻게 다른가요?

- 컴포넌트 내부의 로직 유형
    1. 렌더링 코드(UI 표현하기): 컴포넌트 최상단 위치, props와 state를 적절히 사용하여 JSX 반환
        1. 렌더링 코드 로직은 순수해야 함
    2. 이벤트 핸들러(상호작용 더하기): 무언가를 동작하는 컴포넌트 내부의 중첩 함수
        1. 입력 필드를 업데이트하거나 HTTP 요청을 보내는 등 특정 사용자 입력으로 인해 발생하는 사이드 이펙트 포함
- Effect는 렌더링에 의해 발생하는 부수 효과
    - 채팅에서 메시지를 보내는 것은 이벤트지만, 서버 연결 설정은 Effect
    - 컴포넌트 표시를 주관하는 어떤 상호 작용과도 상관없이 발생해야 함
    - 커밋이 끝나고 화면 업데이트 이후 실행됨

## Effect가 필요 없을지도 모릅니다

- Effect는 주로 React 코드를 벗어난 특정 외부 시스템과 동기화하기 위해 사용
    - 브라우저 API, 서드 파티 위젯, 네트워크 등
- 단순히 다른 상태에 기반하여 조정하는 경우에는 필요하지 않음

## Effect를 작성하는 법

- Effect 3단계
    1. Effect 선언: 기본적으로 모든 커밋 이후 실행
    2. Effect 의존성 지정: Effect는 필요할 때만 실행되어야 함
        1. 예를 들어 페이드 인아웃 애니메이션은 컴포넌트가 나타날 때만 트리거
    3. (필요한 경우) 클린업 함수 추가: 기존 수행 중이던 작업을 중지, 취소 또는 정리하는 방법 지정

### 1단계: Effect 선언하기

- React에서 `useEffect` Hook을 가져와 컴포넌트 최상위 레벨에서 호출
- `useEffect`는 화면에 렌더링이 반영될 때까지 코드 실행을 “지연” 시킴
    - 렌더링 중에 DOM 노드를 조작하려는 경우 `useEffect`로 감싸 실행을 지연시킬 수 있음

```jsx
function MyComponent() {
  useEffect(() => {
    // 이곳의 코드는 *모든* 렌더링 후에 실행됩니다
  });
  return <div />;
}
```

### 2단계: Effect의 의존성 지정하기

- Effect를 불필요하게 매번 실행하지 않아도 되는 경우 `useEffect` 두 번째 인자로 의존성 배열 설정 → 변화를 감지할 대상 설정
- 이전과 동일하다면 실행하지 않도록 함
    - ex. 모든 키 입력마다 채팅 서버 연결, 애니메이션 트리거 등
- React는 `Object.is` 비교를 통해 종속성 값을 비교함
- ref는 의존성 배열에서 생략 가능 → 안정된 식별성(stable identity) 보장
- NOTE) 의존성 배열이 없는 경우와 빈 배열이 있는 경우는 다름

```jsx
useEffect(() => {
  // 모든 렌더링 후에 실행됩니다
});

useEffect(() => {
  // 마운트될 때만 실행됩니다 (컴포넌트가 나타날 때)
}, []);

useEffect(() => {
 // 마운트될 때 실행되며, *또한* 렌더링 이후에 a 또는 b 중 하나라도 변경된 경우에도 실행됩니다
}, [a, b]);
```

### 3단계: 필요하다면 클린업을 추가하세요

- 일반적으로 클린업 함수는 Effect가 수행하던 작업을 중단하거나 되돌리는 역할
- Effect에서 클린업 함수를 반환하게 되면, React는 Effect가 다시 실행되기 전마다 클린업 함수를 호출하고, 컴포넌트 마운트 해제될 때도 마지막으로 호출함
    - 예를 들어 채팅 연결 → 연결 해제 과정이 필요함

```jsx
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

export default function ChatRoom() {
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    return () => connection.disconnect(); // 클린업 함수 리턴
  }, []);
  return <h1>채팅에 오신걸 환영합니다!</h1>;
}
```

## 개발 중 Effect가 두 번 실행되는 경우

- 개발 모드에서는 React가 개발 중 코드 검사를 하여 버그를 찾는 과정에서 연결/해제 과정이 두 번 실행됨
- 제대로 된 동작이므로 수정할 필요 없음

### React로 작성되지 않은 위젯 제어하기

- React로 작성되지 않은 UI 위젯을 제어할 때는 클린업 함수가 필요하지 않음
- 일부 API가 연속 두 번 호출하는 것을 허용하지 않을 때는 클린업 함수 리턴

```jsx
useEffect(() => {
  const dialog = dialogRef.current;
  dialog.showModal();
  return () => dialog.close();
}, []);
```

### 이벤트 구독하기

- Effect가 이벤트를 구독하는 경우 클린업 함수로 구독 해지해야 함

```jsx
useEffect(() => {
  function handleScroll(e) {
    console.log(window.scrollX, window.scrollY);
  }
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 애니메이션 트리거

- Effect가 어떤 요소를 애니메이션으로 표시하는 경우 클린업 함수에서 초기값 재설정해야 함

```jsx
useEffect(() => {
  const node = ref.current;
  node.style.opacity = 1; // Trigger the animation
  return () => {
    node.style.opacity = 0; // Reset to the initial value
  };
}, []);
```

### 데이터 페칭

- Effect가 어떤 데이터를 가져오는 경우 클린업 함수에서는 fetch를 중단하거나 무시해야 함
- 이미 발생한 네트워크 요청을 “취소”할 수는 없지만, 애플리케이션에 영향을 미치지 않도록 해야 함

```jsx
useEffect(() => {
  let ignore = false;

  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);
```

### Effect에서 fetch 호출

- 일반적으로 Effect 안에서 `fetch` 호출하는 것은 유용
- 단, Effect는 서버에서 실행되지 않고, 네트워크 폭포, 미리 로드하거나 캐시하지 않음 등의 단점이 있음

### 분석 보내기

- 페이지 방문 시 분석 이벤트를 보내는 코드 가능

```jsx
useEffect(() => {
  logVisit(url); // POST 요청을 보냄
}, [url]);
```

### Effect가 아닌 경우: 애플리케이션 초기화

- 일부 로직은 애플리케이션 시작 시 한 번만 실행되어야 함 → 컴포넌트 외부에 배치

```jsx
if (typeof window !== 'undefined') { // 브라우저에서 실행 중인지 확인합니다.
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

### Effect가 아닌 경우: 제품 구입하기

- HTTP POST 요청과 같은 로직은 Effect에 위치하면 안 됨 → 사용자가 실제 “구매” 버튼을 눌렀을 때 작동해야 함

## 모든 것들 적용해보기

```jsx
function Playground() {
  const [text, setText] = useState('a');

  useEffect(() => {
    function onTimeout() {
      console.log('⏰ ' + text);
    }

    console.log('🔵 스케줄 로그 "' + text);
    const timeoutId = setTimeout(onTimeout, 3000);

    return () => {
      console.log('🟡 취소 로그 "' + text);
      clearTimeout(timeoutId);
    };
  }, [text]);

```

- “스케줄 로그” → 3초 후 “타임 로그” → 마운트 해제 시 “취소 로그” 순으로 발생

## 요약

- Effect는 특정 상호작용이 아닌 렌더링 자체에 의해 발생
- 컴포넌트를 외부 시스템(API, 네트워크 등)과 동기화
- 모든 렌더링 후에 실행됨
- 모든 의존성이 마지막 렌더링과 동일한 값을 가지면 실행하지 않음
- 의존성은 내부 코드에 의해 결젱되며, 빈 의존성 배열(`[]`)은 컴포넌트 마운팅을 의미
- Strict Mode(개발 환경)에서 React는 컴포넌트를 두 번 마운트 → 스트레스 테스트
- Effect가 다시 마운트로 인해 중단된 경우 클린업 함수 구현해야 함
- React는 Effect가 다음에 실행되기 전에 정리 함수를 호출하며, 마운트 해제 중에도 호출함