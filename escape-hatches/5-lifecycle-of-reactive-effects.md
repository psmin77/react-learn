## effect 생명주기

- 모든 React 컴포넌트는 동일한 생명주기
    - 컴포넌트는 화면에 추가될 때 마운트
    - 컴포넌트는 일반적으로 상호작용에 대한 응답으로 새로운 props나 state 수신하면 업데이트
    - 컴포넌트가 화면에서 제거되면 마운트 해제
- Effect는 컴포넌트와 다르게 동기화 시작과 중지하는 두 가지 작업만 가능
    - 때로는 동기화를 여러 번 시작하고 중지할 수도 있음

### 동기화가 두 번 이상 수행되어야 하는 이유

- prop이 변경될 때, 이전 값으로 연결된 effect를 중지하고 새로운 데이터로 연결해야 함
- cleanup 함수 사용

### React가 effect를 재동기화하는 방법

- cleanup 함수(연결 해제)를 통해 prop이 변경될 때 마다 이전 동기화를 중지하고 새로운 동기화를 연결
- 사용자가 다른 화면으로 이동하면 컴포넌트가 마운트 해제되면서 연결 해제

### effect 관점에서 생각하기

- 컴포넌트 관점
    1. `roomId = “general”` ⇒ 마운트
    2. `roomId = “travel”` ⇒ 업데이트
    3. `roomId = “music”` ⇒ 업데이트
    4. 마운트 해제
- effect 관점
    1. `“general”` 방 연결
    2. `“general”` 방 연결 해제하고 `“travel”` 연결
    3. `“travel”` 방 연결 해제하고 `“music”` 연결
    4. `“music”` 방 연결 해제

⇒ effec는 컴포넌트 마운트 여부와 상관 없이 **동기화 시작과 중지하는 방법만 설명**하면 됨

### React가 effect를 다시 동기화될 수 있는지 확인하는 방법

- 개발 단계에서는 강제로 동기화를 수행하여 effect가 다시 동기화할 수 있는지 확인
- 실제로 effect가 다시 동기화되는 이유는 일부 데이터가 변경된 경우

### React가 effect를 다시 동기화해야 한다는 것을 인식하는 방법

- 종속성 목록에 `roomId`를 설정하여 종속되었다는 것을 알림
- 작동 방식
    1. `roomId`가 prop이므로 시간이 지나면서 변경될 수 있다는 것을 알고 있음
    2. effect가 `roomId`를 읽는다는 것을 알고 있음
    3. 따라서 `roomId`를 종속성으로 지정
- React는 렌더링마다 전달한 의존성 배열을 확인하고 하나라도 이전과 다른 값이 있으면 effect 재동기화

### 각 effect는 별도 동기화 프로세스를 나타냅니다

- 다른 기능이 필요한 로직은 두 개의 독립적인 개별 effect로 추가해야 함

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
   // 방문 분석 이벤트 추가
   // 하나의 effect에 추가할 경우 동일한 연결에도 방문 기록을 실행하기 때문에 별개로 존재해야 함 
    logVisit(roomId);
  }, [roomId]);

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    // ...
  }, [roomId]);
  // ...
}
```

## 반응형 값에 “반응”하는 effect

- `serverUrl`과 같이 변경되지 않는 데이터는 종속성이 될 필요가 없음
- props, state와 같이 React 데이터 흐름에 참여하는 반응형 값은 종속성에 포함되어야 함

### 빈 종속성에 있는 effect 의미

- 만약 `roomId`와 `serverUrl`을 외부로 이동하면 effect 안에서는 어떠한 반응형 값을 사용하지 않으므로 종속성이 비어있게 됨
- → 이후 해당 데이터들의 변경이 필요하게 되면 종속성에 추가하면 됨

```jsx
const serverUrl = 'https://localhost:1234';
const roomId = 'general';

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []);
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

### 컴포넌트 본문에서 선언된 모든 변수는 반응형

- props, state뿐만 아니라 이를 통해 계산하는 일반 변수를 포함하여 컴포넌트 내부의 모든 값은 반응형
- 따라서 effect 종속성 목록에 있어야 함
- effect는 컴포넌트 본문의 모든 값에 “**반응**”함
- NOTE) `ref.current`와 같은 변경 가능한 값은 종속성이 될 수 없음

### React는 모든 반응형 값을 종속성으로 지정했는지 확인합니다

- 린터가 React에 구성된 경우, effect 코드에서 사용되는 모든 반응형 값이 종속성으로 선언되었는지 확인함
- React 오류처럼 보이지만 코드의 버그를 지적하는 것

### 다시 동기화하지 않으려는 경우 어떻게 해야 하나요?

- 렌더링에 의존하지 않는다면 컴포넌트 외부로 옮기거나 effect 내부로 이동하면 반응하지 않음

```jsx
// 컴포넌트 외부
const serverUrl = 'https://localhost:1234'; // serverUrl는 반응형이 아닙니다.
const roomId = 'general'; // roomId는 반응형이 아닙니다.

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ 선언된 모든 종속성
  // ...
}

// 또는 내부로 이동
function ChatRoom() {
  useEffect(() => {
    const serverUrl = 'https://localhost:1234'; // serverUrl는 반응형이 아닙니다.
    const roomId = 'general'; // roomId는 반응형이 아닙니다.
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ 선언된 모든 종속성
  // ...
}
```

- effect는 반응형 코드 블록 → 내부의 값이 변경되면 다시 동기화됨
- 종속성을 선택할 수 없음 → effect에서 읽은 모든 반응형 값이 포함되어야 함
    - effect가 독립적인 동기화 프로세스를 나타내는지 확인해야 함. 아무것도 동기화하지 않는다면 불필요할 수 있음
    - props나 state에 “반응”하지 않거나 effect를 다시 동기화하지 않으면서 최신 값을 읽으려면 effect에 반응하는 부분과 반응하지 않는 부분으로 분리해야 함
    - 객체와 함수를 종속성으로 사용하지 말 것

## 요약

- 컴포넌트는 마운트, 업데이트, 마운트 해제
- 각 effect는 컴포넌트와 별도의 생명주기를 가짐
- 각 effect는 시작 및 중지할 수 있는 별도의 동기화 프로세스를 설명함
- effect를 작성할 때는 컴포넌트(마운트, 업데이트)가 아닌 개별 effect 관점에서 생각해야 함
- 컴포넌트 본문 내부에 선언된 값은 “반응형” 데이터
- effect에서는 반응형 데이터에 따라 동기화
- 린터는 effect 내부에서 사용된 모든 반응형 값이 종속성으로 지정되었는지 확인함