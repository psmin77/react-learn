## 이벤트 핸들러와 Effect 중 선택하기

- 이벤트 핸들러와 Effect 차이점
    1. 채팅방 컴포넌트는 선택된 채팅방에 자동으로 연결해야 함
    2. “전송” 버튼을 클릭하면 메시지를 전송해야 함
- 해당 코드가 실행되어야 하는 이유를 고려해볼 것

### 이벤트 핸들러는 특정 상호작용에 대한 응답으로 실행된다

- 메시지는 “전송” 버튼이 클릭 되었기 때문에 전송되어야 함 → 특정 상호작용 → 이벤트 핸들러

### Effect는 동기화가 필요할 때마다 실행된다

- 채팅방 컴포넌트 연결은 사용자가 채팅방 화면을 보고 있기 때문에 계속 연결되어 있어야 함 → Effect

## 반응형 값과 반응형 로직

- 이벤트 핸들러는 “수동”으로, Effect는 “자동”으로 트리거된다고 할 수 있음
- 이벤트 핸들러 내부의 로직은 반응형이 아님 → 사용자가 상호작용을 반복하지 않는 한 재실행 되지 않음
- Effect 내부의 로직은 반응형 → 그 값을 의존성으로 지정해야 하며, 값이 바뀌는 경우 Effect 재실행

### 이벤트 핸들러 내부의 로직은 반응형이 아니다

- 이벤트 핸들러는 반응형이 아니므로 사용자가 특정 상호작용을 발생시킬 때만 실행됨

### Effect 내부의 로직은 반응형이다

- Effect는 반응형 값을 따라가고, 그 값이 바뀌면 다시 실행되도록 함

## Effect에서 비반응형 로직 추출하기

- 사용자가 채팅 연결할 때 알림을 보여주는 기능 예시
    1. 알림의 색상 테마를 의존성 배열에 추가
    2. 테마 전환할 때마다 채팅도 다시 연결됨
- ⇒ 비반응형 로직은 분리해야 함

### Effect 이벤트 선언하기

```jsx
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('연결됨!', theme);
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
```

- `useEffectEvent` Hook 사용 (`onConnected`)
    - Effect 이벤트 → Effect에서 직접 트리거되므로 이벤트 핸들러와 유사하게 동작
    - 반응형이 아니므로 의존성에서 제외됨

### Effect 이벤트로 최근 props와 state 읽기

- 페이지 방문 기록에 장바구니 개수도 추가할 경우 예시
    1. Effect 내부에서 `items.length`를 사용하여 의존성 반응하게 됨
    2. 장바구니에 물건을 추가한다고 사용자가 다시 페이지를 방문한 것은 아니므로 분리해야 함
    3. `onVisit`은 Effect 이벤트로 데이터 변경에 따라 재실행 되지 않고 사용 가능

```jsx
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);

  useEffect(() => {
    logVisit(url, items.length);
  }, [url]); // 🔴 React Hook useEffect has a missing dependency: 'numberOfItems'
  // ...
}

// 변경
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  
  const onVisit = useEffectEvent(visitedUrl => {
    logVisit(visitedUrl, items.length);
  });

  useEffect(() => {
    onVisit(url);
  }, [url]); // ✅ 모든 의존성 선언됨
  // ...
}
```

### Effect 이벤트의 한계

- Effect 이벤트는 매우 제한적
    - Effect 내부에서만 호출
    - **다른 컴포넌트나 Hook 전달 불가**
    - 항상 자신을 사용하는 Effect 바로 근처에 선언해야 함

## 요약

- 이벤트 핸들러는 특정 상호작용에 대한 응답으로 실행됨
    - 내부 로직은 반응형이 아님
- Effect는 동기화가 필요할 때마다 실행됨
    - 내부 로직은 반응형임
    - 비반응형 로직은 Effect 이벤트로 이동 가능
- Effect 이벤트는 Effect 내부에서만 호출 가능
    - 절대로 다른 컴포넌트나 Hook 전달 금지