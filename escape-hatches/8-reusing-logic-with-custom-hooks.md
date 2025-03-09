## 커스텀 Hook: 컴포넌트 간 로직 공유하기

### 컴포넌트로부터 커스텀 Hook 추출하기

- 네트워크 연결에 따라 state와 화면 표출 메시지를 변경하는 예시
    1. 표출 메시지 외에는 중복되는 로직 발생
    2. `useOnlineStatus` Hook로 분리하여 단순화하고 중복 제거
- 커스텀 Hook을 통해 두 컴포넌트 내부 코드가 **무엇을 하는 지에 대해 설명**하도록 개선됨
    - 브라우저 API나 외부 시스템과의 소통 방법과 같은 불필요한 세부 사항을 숨길 수 있음

```jsx
// useOnlineStatus.js
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}

// App.js
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ 온라인' : '❌ 연결 안 됨'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ 진행사항 저장됨');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? '진행사항 저장' : '재연결 중...'}
    </button>
  );
}

export default function App() {
  return (
    <>
      <SaveButton />
      <StatusBar />
    </>
  );
}
```

### Hook의 이름은 항상 `use`로 시작해야 합니다

- 작명 규칙
    1. React 컴포넌트의 이름은 항상 대문자로 시작
    2. Hook의 이름은 `use` 뒤에 대문자로 시작
- 이러한 규칙들을 통해 이름만으로도 기능들을 예상할 수 있음
    - `useOnlineStatus()` 함수명을 보면 내부에 다른 Hook을 사용할 확률이 높음
    - 반대로 어떤 Hook도 사용하지 않는다면 `use`를 사용하지 않아야 함

### 커스텀 Hook은 state 자체를 공유하는 것이 아닌 state 저장 로직을 공유합니다

- 커스텀 Hook은 state 그 자체가 아닌 **state 저장 로직**을 공유함
    - 같은 Hook을 호출하더라도 **각 Hook은 모두 개별적으로 독립**됨
    - 여러 컴포넌트 간 *state 자체를 공유해야 한다면 state 끌어올리기* 고려

```jsx
import { useState } from 'react';

export function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function handleChange(e) {
    setValue(e.target.value);
  }

  const inputProps = {
    value,
    onChange: handleChange
  };

  return inputProps;
}

// App.js
const firstNameProps = useFormInput('Mary');
const lastNameProps = useFormInput('Poppins');
```

## Hook 사이에 상호작용하는 값 전달하기

- 커스텀 Hook의 코드는 컴포넌트와 함께 재랜더링됨
    - 컴포넌트 본체의 일부분으로 취급
- 필요한 state 값은 파라미터 인자로 넘겨줄 수 있음

```jsx
export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      showNotification('New message: ' + msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}

// App.js
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({ roomId, serverUrl });
...
```

### 커스텀 Hook에 이벤트 핸들러 넘겨주기

- 이벤트 핸들러도 인자로 전달할 수 있음
- 단, 의존성 제거를 위해 Effect 이벤트로 감싸야 함

```jsx
export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  const onMessage = useEffectEvent(onReceiveMessage);
  ...
  onMessage(msg);
```

## 언제 커스텀 Hook을 사용해야 하는지

- 커스텀 Hook으로 감싸는 것은 목적을 정확하게 전달하고 데이터가 어떻게 흐르는지 알 수 있도록 해줌
    - `ShippingForm`에서 하나는 도시, 다른 하나는 선택된 도시의 지역 목록을 보여주는 Effect 예시
    - 다른 두 가지를 동기화하므로 Effect 자체는 분리하는 것이 맞음
    - 하지만 유사한 코드가 거의 반복되므로 커스텀 Hook을 통해 분리할 수 있음

```jsx
function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (url) {
      let ignore = false;
      fetch(url)
        .then(response => response.json())
        .then(json => {
          if (!ignore) {
            setData(json);
          }
        });
      return () => {
        ignore = true;
      };
    }
  }, [url]);
  return data;
}

// ShippingForm
function ShippingForm({ country }) {
  const cities = useData(`/api/cities?country=${country}`);
  const [city, setCity] = useState(null);
  const areas = useData(city ? `/api/areas?city=${city}` : null);
  // ...
```

- NOTE) 고급 사용 사례
    1. 커스텀 Hook의 이름은 좀 더 기술적이고 해당 시스템을 특정하는 용어 사용
        1. `useMediaQuery(query)`, `useSocket(url)`
    2. “생명 주기” Hook을 생성하거나 사용하는 것은 피하기
        1. `useMount(fn)`
    3. 좋은 커스텀 Hook은 호출 코드가 하는 일을 제한하면서 선언적으로 만들 수 있음

### 커스텀 Hook은 더 나은 패턴으로 변경하도록 도와줍니다

- Effect를 커스텀 Hook으로 감싸는 것이 유용한 이유
    1. 매우 명확하게 Effect로 주고받는 데이터 흐름을 만들 때
    2. 컴포넌트가 Effect의 목적에 집중하도록 할 때
    3. React가 새 기능을 추가할 때 다른 컴포넌트의 변경 없이 해당 Effect를 삭제할 수 있을 때

## 요약

- 커스텀 Hook을 사용하면 컴포넌트 간 로직을 공유할 수 있음
- 커스텀 Hook의 이름은 `use` 뒤에 대문자로 시작되어야 함
- 커스텀 Hook은 state 자체가 아닌 저장 로직만 공유함
- 하나의 Hook에서 다른 Hook으로 반응형 값과 함수를 전달할 수 있음
- 모든 Hook은 컴포넌트가 재랜더링될 때 함께 재실행됨
- 커스텀 Hook의 코드는 컴포넌트 코드처럼 순수해야 함
- 커스텀 Hook을 통해 전달 받는 이벤트 핸들러는 Effect로 감싸야 함
- `useMount`와 같은 생명주기 Hook은 만들면 안 됨