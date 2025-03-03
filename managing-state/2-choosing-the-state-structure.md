## State 구조와 원칙

- 상태를 갖는 구성요소를 작성할 대, 사용할 state 변수의 수와 데이터 형태를 선택해야 함
- 원칙
  1. 연관된 state 그룹화하기 → 두 개 이상의 state 변수를 항상 동시에 업데이트한다면 단일 state 병합
  2. State 모순 피하기 → 여러 state가 서로 모순되고 “불일치”하지 않는지 확인
  3. 불필요한 state 피하기
  4. State 중복 피하기
  5. 깊게 중첩된 state 피하기 → 가능하면 state를 평탄한 방식으로 구성할 것

## 연관된 state 그룹화하기

- 두 개의 state 변수가 항상 함께 변경된다면 하나의 단일 state로 통합
- 필요한 state의 조각 수를 모를 경우에 그룹화
  - ex. 사용자 커스텀 필드를 추가하는 양식 등
- NOTE) State 변수가 객체인 경우 하나의 필드만 업데이트할 수 없음. 반드시 다른 필드를 명시적으로 복사해야 함

## State의 모순 피하기

- 여러 state 간의 상태가 모순되는지 확인할 것

```jsx
// Bad
// 둘 중 하나라도 상태 변경하는 것을 잊어버려서 true-true, false-false가 된다면 오류 발생
const [text, setText] = useState("");
const [isSending, setIsSending] = useState(false);
const [isSent, setIsSent] = useState(false);

// Good
const [text, setText] = useState("");
const [status, setStatus] = useState("typing"); // 'sending', 'sent'
```

## 불필요한 state 피하기

- 기존 데이터에서 일부 정보를 계산할 수 있다면 state로 선언할 필요 없음
- ex. `fullName`, `firstName`, `lastName`이 모두 필요하지 않음
  - `fullName = firstName + lastName;`
  - `firstName + lastName = fullName;`
- NOTE) Props를 state에 미러링하지 말 것
  - state 변수는 첫 번째 렌더링 중에만 초기화되므로 props 데이터가 변경되어도 업데이트 되지 않음
  - 필요한 경우 일반 상수나 변수에 할당해서 사용해야 함

## State 중복 피하기

- 다른 데이터로 연산해서 사용할 수 있다면 중복 데이터를 제거하고 필수적인 state만 유지할 것

## 깊게 중첩된 state 피하기

- 데이터를 업데이트하기에 너무 중첩되어 있다면 “평탄”하게 만들도록 고려할 것
  - “정규화”라고도 함

## 요약

- 여러 개의 state 변수가 항상 함께 업데이트 된다면 병합을 고려
- 불가능한 (= 모순적인) state가 아닌지 확인
- state를 구조화할 것
- 불필요하고 중복된 state를 피할 것
- 특별한 경우가 아니면 props를 state를 미러링하지 말 것
- 객체 자체가 아닌 ID 또는 인덱스로 특정 데이터를 선택하도록 고려
- 깊게 중첩되어 업데이트가 복잡한 경우 평탄화 고려
