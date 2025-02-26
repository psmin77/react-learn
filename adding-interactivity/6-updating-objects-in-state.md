## 변경이란?

- State에는 모든 종류의 자바스크립트 값을 저장할 수 있음
- 원시 값(숫자, 문자, 불리언)은 “읽기 전용”으로 “불변성”을 가짐
- 객체 자체의 내용은 **변경(mutation)** 가능하지만, 변경 대신 “교체”해야 함

## State 읽기 전용으로 다루기

- state에 저장한 자바스크립트 객체는 “읽기 전용”으로 다루어야 함
- 객체 내부의 값만 변경하면 React에서 감지할 수 없음
- → 리렌더링을 발생시키려면 새 객체를 생성하여 state 설정 함수로 전달해야 함
- NOTE) 지역 변경(local mutation)은 상관 없음
  - → 방금 생성한 새로운 객체를 변경하기 때문에
  - → 아직 다른 코드가 해당 객체를 참조하지 않기 때문에

## 전개 문법으로 객체 복사하기

- 변경된 일부 데이터 외에 다른 데이터는 유지하기 위해 객체 전개 구문(`…`) 사용하여 모든 프로퍼티 복사
- 얕은 복사이므로 주의할 것

```jsx
setPerson({
  firstName: e.target.value, // input의 새로운 first name
  lastName: person.lastName,
  email: person.email,
});

// 객체 전개 구문 적용
setPerson({
  ...person, // 이전 필드를 복사
  firstName: e.target.value, // 새로운 부분은 덮어쓰기
});
```

- NOTE) 하나의 단일 이벤트 핸들러로 여러 필드 사용하기

```jsx
function handleChange(e) {
  setPerson({
    ...person,
    [e.target.name]: e.target.value,
  });
}
```

## 중첩된 객체 갱신하기

- 각 레벨마다 복사해야 함

```jsx
const [person, setPerson] = useState({
  name: "Niki de Saint Phalle",
  artwork: {
    title: "Blue Nana",
    city: "Hamburg",
    image: "https://i.imgur.com/Sd1AgUOm.jpg",
  },
});

setPerson({
  ...person, // 다른 필드 복사
  artwork: {
    // artwork 교체
    ...person.artwork, // 동일한 값 사용
    city: "New Delhi", // 하지만 New Delhi!
  },
});
```

- NOTE) 실제로는 중첩된 것이 아니라 객체 안에서 별도의 다른 객체를 가리키는 것이기 때문에

```jsx
let obj1 = {
  title: "Blue Nana",
  city: "Hamburg",
  image: "https://i.imgur.com/Sd1AgUOm.jpg",
};

let obj2 = {
  name: "Niki de Saint Phalle",
  artwork: obj1,
};
```

### Immer로 간결한 갱신 로직 작성하기

- Immer 라이브러리 활용
  - 중첩된 객체의 변경과 복사본 생성을 도와주는 라이브러리
  - `draft`는 Proxy라는 객체 타입으로, 내부적으로 어느 부분이 변경됐는지 알아내고 새로운 객체를 생성함
- 사용 방법
  1. dependencies immer 라이브러리 추가
  2. `useState` 대신 `useImmer` 사용

## 요약

- React의 모든 state는 “불변”
- 객체는 변경하는 대신 새로운 객체를 생성하여 교체해야 함 → 리렌더링 발생
- 객체를 복사하기 위해 객체 전개 구문 사용
  - 전개 구문은 얕은 복사만 가능
  - 중첩된 객체를 복사하기 위해서는 모든 레벨에서 수행해야 함
- Immer 라이브러리 활용 가능
