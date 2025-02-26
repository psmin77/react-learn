## React state batches 업데이트

- React는 state 업데이트 하기 전에 모든 이벤트 핸들러가 실행될 때까지 기다림
- 불필요한 리렌더링을 최소화하고 state 변수를 업데이트할 수 있음
  - → **batching**

## 동일한 state 변수를 여러 번 업데이트

- 업데이터 함수(updater function)
  - React는 이벤트 핸들러가 모두 실행된 후에 이 함수가 처리되도록 큐에 넣음
  - 다음 렌더링 중에 React는 큐를 순회하여 최종 업데이트된 state 제공
  - 업데이터 함수는 순수해야 하며, 결과만 반환해야 함

| queued update | n   | returns |
| ------------- | --- | ------- |
| n ⇒ n + 1     | 0   | 0+1 = 1 |
| n ⇒ n + 1     | 1   | 1+1 = 2 |
| n ⇒ n + 1     | 2   | 2+1 = 3 |

### state 교체 후 업데이트하면?

```jsx
import { useState } from "react";

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber(number + 5);
          setNumber((n) => n + 1);
        }}
      >
        Increase the number
      </button>
    </>
  );
}
```

| queued update  | n         | returns |
| -------------- | --------- | ------- |
| replace with 5 | 0(unused) | 5       |
| n ⇒ n + 1      | 5         | 5+1 = 6 |

### 업데이트 후 state를 변경하면?

- 위 상황에서 `setNumber(42)` 추가하면 최종 결과로 저장하여 `number = 42` 반환

### 명명 규칙

- 일반적으로 해당 state 변수의 첫 글자로 지정
- 또는 전체 state 변수 이름을 반복
- 또는 접두사와 사용하기도 함

```jsx
setEnabled((e) => !e);
setLastName((ln) => ln.reverse());
setFriendCount((fc) => fc * 2);

setEnabled((enabled) => !enabled);

setEnabled((preEnabled) => !prevEnabled);
```

## 요약

- state를 설정하더라도 기본 렌더링 변수는 변경되지 않음 → 새로운 렌더링 요청
- React는 모든 이벤트 핸들러 실행이 끝난 후 state 업데이트 처리함 → **batching**
- 일부 state를 여러 번 업데이트 하려면 업데이터 함수 사용
