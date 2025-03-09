## 의존성은 코드와 일치해야 합니다

- Effect는 반응형 값에 “반응”
- Effect 코드에서 사용하는 모든 반응형 값은 의존성 목록에 추가해야 함

### 의존성을 제거하려면 의존성이 아님을 증명하세요

- Effect 의존성은 “선택”할 수 없음 → 의존성 설정하지 않으면 린터 오류 발생
- 의존성 제거하려면 해당 컴포넌트가 반응형 값이 아니라는 것을 증명해야 함
    - *예를 들어 컴포넌트 밖으로 이동*

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []); // 🔴 React Hook useEffect has a missing dependency: 'roomId'
  // ...
}

const roomId = 'music'; // Not a reactive value anymore
...    }, []); // ✅ All dependencies declared
```

### 의존성을 변경하려면 코드를 변경하세요

- 의존성 변경을 위해 코드 변경
    1. Effect 코드 또는 반응형 값 선언 방식을 변경
    2. 변경한 코드에 맞게 의존성 조정
    3. 의존성 목록이 맞지 않는다면 첫 번째 단계로 돌아감
        1. 의존성 목록 = Effect 코드에서 사용하는 모든 반응형 값의 목록
- NOTE) 린터를 억제하지 않도록 주의 → 버그 발생할 확률이 높음

## 불필요한 의존성 제거하기

- 의존성 조정할 때 살펴볼 점
    - 다른 조건에서 Effect의 다른 부분을 다시 실행하고 싶을 때
    - 일부 의존성 변경에 반응하지 않고 “최신 값”만 읽고 싶을 때
    - 의존성은 객체나 함수이기 때문에 의도치 않게 자주 변경될 수 있음

### 이벤트 핸들러로 옮겨야 하나요?

- 가장 먼저 고려해야 할 것은 Effect가 맞는지 확인
    - *폼을 제출할 때 POST 요청을 보내고 알림을 표시하는 예시*
        1. `submitted = true`에 “반응”하는 Effect
        2. 알림 메시지에 적용하는 `theme`에도 “반응”하여 테마 변경할 때도 실행됨
        - → Effect가 아닌 이벤트 핸들러로 변경해야 함

### Effect가 관련 없는 여러 작업을 수행하나요?

- Effect가 서로 관련 없는 여러 가지 작업을 수행하고 있는지 확인
    - *사용자가 도시와 지역을 선택해야 하는 배송 폼 예시*
        1. 선택한 나라에 따라 도시 목록을 가져와야 함
            1. → `country`가 변경될 때마다 데이터를 가져와야 하므로 effect 맞음
        2. 선택한 도시에 따라 지역을 가져와야 함
            1. → 두 개의 Effect로 분리 (각 Effect는 독립적인 동기화 프로세스를 가져야 함)

### 다음 State를 계산하기 위해 어떤 State를 읽고 있나요?

- 새로운 메시지가 도착하면 `messages` State에 추가하는 예시

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      // 🔴 messages가 변경될 때마다 채팅이 다시 연결됨
      setMessages([...messages, receivedMessage]);
      
      // ✅ messages 변수를 읽지 않고 의존하지 않으므로 다시 연결되지 않음
      setMessages(msgs => [...msgs, receivedMessage]);
    });
    return () => connection.disconnect();
  }, [roomId, messages]);
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

### 값의 변경에 “반응”하지 않고 값을 읽고 싶으신가요?

- 새 메시지를 수신할 때 `isMuted` 설정에 따라 사운드를 재생하는 예시
    1. effect 내부에서 조건문을 체크하려면 `isMuted`를 의존성 추가해야 함
    2. `isMuted` 값이 변경될 때마다 새로 연결됨
        1. → `isMuted`를 반응하지 않는 Effect 이벤트 핸들러로 이동
        2. → props을 사용할 때도 동일함
- Effect를 사용할 때 반응형 코드와 비반응형 코드를 분리하는 것도 고려해야 함

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const onMessage = useEffectEvent(receivedMessage => {
    setMessages(msgs => [...msgs, receivedMessage]);
    if (!isMuted) {
      playSound();
    }
  });

  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      onMessage(receivedMessage);
    });
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

### 일부 반응형 값이 의도치 않게 변경되나요?

- 의존성 목록에 “**객체**”가 있는 경우
    1. 컴포넌트를 재렌더링할 때마다 새로운 객체가 생성됨
    2. Effect도 그때마다 다시 동기화하고 연결됨
- 자바스크립트에서는 새로 생성된 객체와 함수는 이전과 다른 구별되는 것으로 간주함 (내용이 동일하더라도)
    - 객체 및 함수 의존성으로 인해 Effect가 필요 이상으로 재동기화될 수 있음
    - → 따라서 객체와 함수는 Effect 의존성으로 사용하지 않아야 함
    - → 컴포넌트 외부나 Effect 내부로 이동하거나 원시 값을 추출하는 방법으로 변경

### 정적 객체와 함수를 컴포넌트 외부로 이동

- 객체나 함수가 props 또는 state에 의존하지 않는 경우 컴포넌트 외부로 이동할 수 있음

```jsx

function createOptions() {
  return {
    serverUrl: 'https://localhost:1234',
    roomId: 'music'
  };
}
const options = {
  serverUrl: 'https://localhost:1234',
  roomId: 'music'
};

function ChatRoom() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 객체 생성하는 함수
    const options = createOptions();

    // 또는 객체 바로 사용
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, []); // ✅ All dependencies declared
  // ...
```

### 동적 객체 및 함수를 Effect 내부로 이동

- props이나 반응형 값에 의존하는 경우 Effect 내부로 이동

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const options = {
      serverUrl,
      roomId
    };
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

### 객체에서 원시 값 읽거나 함수에서 계산

- props이 객체나 함수인 경우 Effect 외부에서 읽어서 사용

```jsx
function ChatRoom({ options, getOptions }) {
  const [message, setMessage] = useState('');

  const { roomId, serverUrl } = options;
  // 또는
  const { roomId, serverUrl } = getOptions();
  useEffect(() => {
    const connection = createConnection({
      roomId,
      serverUrl
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, serverUrl]); // ✅ All dependencies declared
  // ...
```

## 요약

- 의존성은 항상 코드와 일치해야 함
- 린터를 억제하지 않고, 의존성을 제거하려면 해당 의존성이 필요하지 않다는 것을 증명해야 함
- 특정 상호작용에 대한 응답은 “이벤트 핸들러”
- 다른 이유로 실행되어야 하는 경우는 Effect를 분리해야 함
- 이전 State를 기반으로 일부 State를 업데이트하려면 업데이터 함수를 전달
- “반응”하지 않고 최신 값을 읽으려면 Effect 이벤트 추출
- 자바스크립트에서 객체와 함수는 서로 다른 시간에 생성된 경우 다른 데이터로 간주함
- 객체와 함수의 의존성을 피하고 컴포넌트 외부나 Effect 내부로 이동