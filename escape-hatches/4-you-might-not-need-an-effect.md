## 불필요한 Effect 제거하는 방법

- Effect가 필요하지 않은 경우
  - 렌더링을 위해 데이터를 변환 → props나 state 사용
  - 사용자 이벤트 처리 → 이벤트 핸들러
- Effect가 필요한 경우
  - 외부 시스템과의 동기화 (API 호출 등)

### props 또는 state에 따라 state 업데이트하기

- 기존 props나 state로 계산할 수 있다면 렌더링 중에 계산

```jsx
function Form() {
  const [firstName, setFirstName] = useState("Taylor");
  const [lastName, setLastName] = useState("Swift");

  // 🔴 피하세요: 중복된 state 및 불필요한 Effect
  const [fullName, setFullName] = useState("");
  useEffect(() => {
    setFullName(firstName + " " + lastName);
  }, [firstName, lastName]);

  // ✅ 좋습니다: 렌더링 중에 계산됨
  const fullName = firstName + " " + lastName;
}
```

### 비용이 많이 드는 계산 캐싱하기

- 캐싱이 필요한 경우 `useMemo` Hook 사용
- `useMemo`로 감싸는 함수는 렌더링 중에 실행되므로 순수한 계산에만 작동함

```jsx
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState("");

  // 🔴 피하세요: 중복된 state 및 불필요한 효과
  const [visibleTodos, setVisibleTodos] = useState([]);
  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);

  // ✅ 1. getFilteredTodos()가 느리지 않다면 괜찮습니다.
  const visibleTodos = getFilteredTodos(todos, filter);

  // ✅ 2. todos나 filter가 변경되지 않는 한 getFilteredTodos()를 다시 실행하지 않습니다.
  const visibleTodos = useMemo(
    () => getFilteredTodos(todos, filter),
    [todos, filter]
  );
}
```

### prop 변경 시 모든 state 초기화

- props가 변경될 때 state 변수를 초기화하는 경우

```jsx
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  // 🔴 피하세요: Effect에서 prop 변경 시 state 초기화
  useEffect(() => {
    setComment('');
  }, [userId]);
  // ...
}

// 수정
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId} // key 어트리뷰트 전달
    />
  );
}

function Profile({ userId }) {
  // ✅ 이 state 및 아래의 다른 state는 key 변경 시 자동으로 재설정됩니다.
  const [comment, setComment] = useState('');
  // ...
}
```

### prop이 변경될 때 일부 state 조정하기

- prop이 변경될 때 일부 state만 재설정하거나 조정하려는 경우, Effect 대신 렌더링 중에 직접 state 조정

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 피하세요: Effect에서 prop 변경 시 state 조정하기
  useEffect(() => {
    setSelection(null);
  }, [items]);

  // ✅ 1. 더 좋습니다: 렌더링 중 state 조정
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }

  // ✅ 2. 최고예요: 렌더링 중에 모든 것을 계산
  const [selectedId, setSelectedId] = useState(null);
  const selection = items.find((item) => item.id === selectedId) ?? null;
}
```

### 이벤트 핸들러 간 로직 공유

- Effect인지 이벤트 핸들러인지 확실하지 않은 경우 코드가 실행되어야 하는 이유를 다시 고려
  - 컴포넌트가 사용자에게 표시되었기 때문에 실행되어야 하는 코드 → Effect (ex. 채팅서버 연결)
  - 사용자가 버튼을 눌렀기 때문에 실행되어야 하는 코드 → 이벤트 핸들러 (ex. 구매 확인 알람)
- 동일하게 실행하는 공유 로직은 별도 함수로 분리하여 호출

```jsx
function ProductPage({ product, addToCart }) {
  // 🔴 피하세요: Effect 내부의 이벤트별 로직
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);

  // ✅ 좋습니다: 이벤트 핸들러에서 이벤트별 로직이 호출됩니다.
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to the shopping cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo("/checkout");
  }
  // ...
}
```

### POST 요청 보내기

- Form 컴포넌트에서 두 가지 종류의 POST 요청 전송한다고 할 때
  1. 마운트 될 때 `analytics` 이벤트 호출
     1. → 사용자가 화면에서 컴포넌트 보는 것이라면 **Effect**
  2. Submit 버튼 클릭할 때 `register` POST 요청
     1. → 특정 상호작용으로 인해 발생하는 것이라면 **이벤트 핸들러**

```jsx
function Form() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // ✅ 좋습니다: 컴포넌트가 표시되었으므로 이 로직이 실행되어야 합니다.
  useEffect(() => {
    post("/analytics/event", { eventName: "visit_form" });
  }, []);

  // 🔴 피하세요: Effect 내부의 이벤트별 로직
  const [jsonToSubmit, setJsonToSubmit] = useState(null);
  useEffect(() => {
    if (jsonToSubmit !== null) {
      post("/api/register", jsonToSubmit);
    }
  }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();

    // ✅ 좋습니다: 이벤트별 로직은 이벤트 핸들러에 있습니다.
    post("/api/register", { firstName, lastName });
  }
  // ...
}
```

### 연쇄 계산

- 다른 state에 따라 각각 state를 조정하는 Effect 체이닝하는 경우
  1. 매우 비효율적 → 컴포넌트는 체인의 각 `set` 호출 사이에 불필요한 리렌더링 발생
  2. 코드 로직이 요구사항에 맞지 않는 경우 발생
- 렌더링 중에 계산 가능한 것과 이벤트 핸들러에서 state 조정하도록 변경해야 함

### 애플리케이션 초기화

- 앱이 로드될 때 한 번만 실행되어야 하는 경우 최상위 변수를 추가하여 체크하거나 모듈 초기화 또는 앱 렌더링 이전에 실행할 수 있음

```jsx
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ 앱 로드당 한 번만 실행
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
  // ...
}

// 또는
if (typeof window !== "undefined") {
  // 브라우저에서 실행 중인지 확인합니다.
  // ✅ 앱 로드당 한 번만 실행
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

### state 변경을 부모 컴포넌트에게 알리기

- 하위 컴포넌트에서 내부 state가 변경될 때 부모 컴포넌트에 알리려면 두 state를 같이 업데이트할 것
- 불필요한 state는 제거하거나 state 끌어올리기 고려

```jsx
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function updateToggle(nextIsOn) {
    // ✅ 좋습니다: 업데이트를 유발한 이벤트가 발생한 동안 모든 업데이트를 수행합니다.
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    updateToggle(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      updateToggle(true);
    } else {
      updateToggle(false);
    }
  }

  // ...
}
```

### 부모에게 데이터 전달하기

- 자식 컴포넌트가 부모 컴포넌트의 state를 업데이트하면 데이터 흐름을 추적하기 매우 어려움
- 부모 컴포넌트에서 자식 컴포넌트로 데이터를 내려주도록 흐름을 변경할 것

### 외부 저장소 구독하기

- [`useSyncExternalStore`](https://ko.react.dev/reference/react/useSyncExternalStore)호출로 대체 가능

```jsx
function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnlineStatus() {
  // ✅ 좋습니다: 내장 Hook으로 외부 스토어 구독하기
  return useSyncExternalStore(
    subscribe, // 동일한 함수를 전달하는 한 React는 다시 구독하지 않습니다.
    () => navigator.onLine, // 클라이언트에서 값을 얻는 방법
    () => true // 서버에서 값을 얻는 방법
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

### 데이터 가져오기

- 경쟁 조건으로 인해 서로 다른 여러 요청이 발생하는 경우 잘못된 결과가 표시될 수 있음
- 오래된 응답을 무시하는 **정리 함수**를 추가해야 함
- 실제 애플리케이션에서는 사용자 정의 Hook을 통해 효율적인 데이터 가져오기 전략이 필요함

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then((json) => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => (ignore = true);
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

## 요약

- 렌더링 중에 계산할 수 있다면 Effect가 필요하지 않음
- 비용이 많이 드는 계산을 캐시하려면 `useMemo` 사용
- 전체 컴포넌트 트리의 state 초기화하려면 다른 `key` 전달
- prop 변경에 대한 응답으로 특정 state 부분을 조정하려면 렌더링 중에 설정
- 컴포넌트가 표시되어 실행되는 코드는 **Effect**, 사용자 상호 작용 등은 **이벤트 핸들러**
- 여러 컴포넌트의 state를 업데이트 해야 하는 경우 단일 이벤트 수행하는 것이 좋음
- 다른 컴포넌트의 state 변수를 동기화하려면 state 끌어올리기 고려할 것
- Effect를 통해 데이터를 가져오려면 경쟁 조건을 피하기 위한 정리 함수가 필요함
