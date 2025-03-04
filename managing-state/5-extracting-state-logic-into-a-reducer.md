## reducer를 사용하여 state 로직 통합하기

- 컴포넌트가 커질수록 내부 로직도 복잡해질 수 있음
- 컴포넌트 내부의 state 로직을 외부의 “reducer”라는 단일 함수로 옮길 수 있음

### 1단계: dispatch 함수 전달로 변경

- 기존에는 state 직접 설정하고 “무엇을 할 지” 지시하는 방식
- reducer는 “_action_”을 전달하여 “_사용자가 방금 한 일_”을 지정함
  - action 객체는 어떤 형태든 가능
  - 일반적으로 `type: action(추가/변경/삭제)`, 이외의 정보는 다른 필드에 담아서 전달
- tasks → **task action(추가/변경/삭제)** 전달

```jsx
// state tasks 전달
function handleDeleteTask(taskId) {
  setTasks(tasks.filter((t) => t.id !== taskId));
}

// reducer action 전달
function handleDeleteTask(taskId) {
  dispatch({
    type: "deleted",
    id: taskId,
  });
}
```

### 2단계: reducer 함수 작성

- reducer 함수는 state에 대한 로직 작성
- 두 개의 인자(state와 action 객체)를 전달받고 state 결과를 반환
  - 일반적으로 switch문 사용하는 규칙
- 컴포넌트 외부에서 선언할 수 있음

```jsx
function tasksReducer(tasks, action) {
  switch (action.type) {
    case "added": {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case "changed": {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case "deleted": {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
```

### 3단계: 컴포넌트에서 reducer 사용

- React의 `useReducer` hook 호출
- `useState` → `useReducer`로 변경
  - `useReducer`는 두 개의 인자를 전달 받음 (reducer 함수, 초기 state 값)
  - 그리고 state 담은 값, `dispatch` 함수 반환

```jsx
import { useReducer } from "react";

// const [tasks, setTasks] = useState(initialTasks);
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```

## `useState`와 `useReducer` 비교

- 코드 크기
  - `useState`: 일반적으로 미리 작성해야 하는 코드가 적음
  - `useReducer`: reducer 함수와 action 전달 로직을 모두 작성해야 함
  - 하지만 이벤트 핸들러에서 state를 자주 업데이트하는 경우 reducer 함수가 간단해짐
- 가독성
  - `useState`: 간단한 state 경우 가독성이 더 좋음
  - `useReducer`: 복잡한 구조에서 업데이트 로직이나 이벤트 발생 부분을 명확하게 구별 가능
- 디버깅
  - `useState`: 원인이나 발생 위치를 파악하기 어려움
  - `useReducer`: reducer에 콘솔 로그를 추가하여 디버깅 용이, but 더 많은 코드를 단계별로 실행할 때도 있음
- 테스팅
  - `useReducer`: 컴포넌트에 의존하지 않는 순수 함수이므로 테스트 유용
- state 업데이트로 인해 자주 버그가 발생하거나 복잡하다면 reducer 도입을 고려하면 좋음

## reducer 작성하기

- 순수 함수여야 함
  - reducer는 렌더링 중에 실행되므로 순수하게 입력 값이 같다면 결과 값도 항상 같아야 함
  - 사이드 이펙트를 수행하면 안 됨
  - 객체와 배열을 변경하지 않고 업데이트 해야 함
- 하나의 사용자 상호작용 설명해야 함
  - 예를 들어 5개의 필드가 있는 양식에서 “재설정”을 누른 경우, 5개의 개별 action(`reset_field`)보다는 하나의 action(`reset_form`)을 전송해야 함

### Immer로 간결한 reducer 작성하기

- `useImmerReducer` 사용 가능

## 요약

- `useReducer` 변환 방법
  1. 이벤트 핸들러에서 action 전달
  2. 주어진 state와 action에 대해 다음 state를 반환하는 reducer 함수 작성
  3. `useState`를 `useReducer`로 변경
- reducer를 사용하면 디버깅과 테스트에 도움
- reducer는 순수해야 하며, 단일 사용자 상호작용을 설명해야 함
- 객체와 배열에서는 `useImmerReducer` 사용 가능
