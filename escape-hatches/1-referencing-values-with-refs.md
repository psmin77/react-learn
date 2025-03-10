# Ref로 값 참조하기

- 컴포넌트가 일부 정보를 “기억”하면서 렌더링을 유발하지 않도록 할 때 **ref** 사용

## 컴포넌트에 ref 추가하기

- React의 `useRef` Hook을 가져와 ref 추가할 수 있음
- 초기값을 유일한 인자로 전달
  - 문자열, 객체, 함수 등 모든 형태 가능
- `ref = { current : ‘초기값’ }` 을 반환
  - `ref.current` 프로퍼티를 통해 해당 ref의 current 값에 접근해 읽고 쓸 수 있음
- 컴포넌트는 state와 달리 ref를 변경해도 리렌더링 되지 않음
  - 이벤트 핸들러에게만 필요하고 리렌더링이 필요하지 않다면 ref 사용이 효율적

## 예시: 스톱워치 작성하기

- 사용자가 “시작”을 누른 시간과 현재 시간을 추적하기 위해 state
- “중지”를 눌렀을때 `clearInterval` 호출하기 위한 intervalID는 ref에 저장

## ref와 state 차이

| **refs**                                                    | **state**                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `useRef(initialValue)` ⇒ `{ current: initialValue}` 반환    | `useState(initialValue)` ⇒ `[initialValue, setValue]` 반환              |
| state 변경해도 리렌더되지 않음                              | state 변경하면 리렌더 발생                                              |
| **Mutable** → 렌더링 프로세스 외부에서 current 값 수정 가능 | **Immutable** → setter 함수로만 변경 가능하며 리렌더 대기열에 넣어야 함 |
| 렌더링 중에는 current 값 사용 불가                          | 사용 제한 없음. 단 자체적인 state의 snapshot 존재                       |

## refs를 사용할 시기

- 일반적으로 컴포넌트의 형태에 영향을 미치지 않는 브라우저 API와 통신하는 경우
- 컴포넌트가 일부 값을 저장해야 하지만 렌더링 로직에 영향을 미치지 않는 경우
  - timeout IDs 저장
  - 별도 상황의 DOM 엘리먼트 저장 및 조작
  - JSX를 계산하는 데 필요하지 않은 다른 객체 저장

## refs의 좋은 예시

- refs를 탈출구로 간주 → 외부 시스템이나 브라우저 API 작업 시 유용
- 렌더링 중에 사용 불가 → 렌더링 중에 정보가 필요한 경우 state 사용 권장
  - ref 자체가 일반 자바스크립트 객체처럼 작동하므로 즉시 반영됨

## Refs와 DOM

- 일반적인 ref의 사례는 DOM 엘리먼트 액세스
  - `<div ref={myRef}>` → `myRef.current = DOM 엘리먼트` → DOM 제거되면 `null`

## 요약

- Refs는 렌더링 되지 않는 고정하기 위한 탈출구이며, 자주 사용하지 않음
- `ref.current`프로퍼티를 호출할 수 있는 자바스크립트 순수 객체
- `useRef` Hook을 호출하여 사용
- 컴포넌트의 렌더링 간 정보 유지 가능
- 리렌더 트리거 되지 않음
- 렌더링 중에 `ref.current` 사용 금지
