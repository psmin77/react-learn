## 선언형 UI와 명령형 UI 비교

- 명령형 UI 프로그래밍
  - UI를 조작하기 위해 발생한 상황에 따라 정확한 지침을 작성해야 함
  - ex. 텍스트 입력 → 버튼 활성화, 버튼 클릭 → 스피너 등
- 선언형 프로그래밍
  - React는 직접 UI를 조작하지 않고 무엇을 보여주고 싶은지 선언함

## UI를 선언적인 방식으로 생각하기

- React에서 UI를 구현하는 방식 (선언형)
  1. 컴포넌트의 다양한 시각적 state 확인
  2. 무엇이 state 변화를 트리거하는지 확인
  3. `useState`를 사용해 메모리의 state 표현
  4. 불필요한 state 변수 제거
  5. state 설정을 위해 이벤트 핸들러 연결

### 첫 번째: 컴포넌트의 다양한 시각적 state 확인하기

- 사용자가 볼 수 있는 UI 모든 “state”를 시각화해야 함
  - Empty: 폼은 비활성화된 “제출” 버튼을 가지고 있음
  - Typing: 폼은 활성화된 “제출” 버튼을 가지고 있음
  - Submitting: 폼은 완전히 비활성화되고 스피너 표출
  - Success: 폼 대신 “감사합니다” 메시지 표출
  - Error: “Typing” state와 동일하지만 오류 메시지 표출
  - ex. `status = ‘empty’, ‘success’, ‘submitting’` 으로 UI 컨트롤

### 두 번째: 무엇이 state 변화를 트리거하는지 확인하기

- 인풋 유형
  - 버튼 클릭, 필드 입력, 링크 이동 등의 휴먼 인풋
  - 네트워크 응답, 타임아웃, 이미지 로딩 등의 컴퓨터 인풋
- UI 업데이트를 위해 state 변수 설정하여 인풋에 따라 state를 변경해야 함

### 세 번째: 메모리의 state를 `useState`로 표현하기

- `useState`를 사용하여 컴포넌트의 시각적 state 표현
  - “단순함”이 핵심
  - 각각의 state는 “움직이는 조각”이며, 적을수록 좋음
- 반드시 필요하고 확실한 state를 먼저 추가하는 방식으로 시작할 것

```jsx
const [answer, setAnswer] = useState("");
const [error, setError] = useState(null);

const [isEmpty, setIsEmpty] = useState(true);
const [isTyping, setIsTyping] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [isError, setIsError] = useState(false);
```

### 네 번째: 불필요한 state 변수 제거

- 고려할 점
  - state가 모순점은 없는지?
    - `isTyping`과 `isSubmitting`이 동시에 true인 경우는 없음
    - `isTyping`, `isSubmitting`, `success`를 하나의 status로 통합 가능
  - 다른 state 변수에 이미 같은 정보를 포함하는지?
    - `isEmpty`와 `isTyping`은 동시에 true가 될 수 없음
    - `isEmpty` 대신 `answer.length === 0` 으로 체크할 수 있음
  - 다른 변수를 뒤집었을 때 같은 정보를 얻을 수 있는지?
    - `isError` 대신 `error ≠= null` 로도 확인 가능
- 데이터를 지웠을 때 정상적으로 작동하지 않으면 필수 데이터

```jsx
const [answer, setAnswer] = useState("");
const [error, setError] = useState(null);
const [status, setStatus] = useState("typing"); // 'typing', 'submitting', or 'success'
```

### 다섯 번째: state 설정을 위해 이벤트 핸들러 연결하기

- 이벤트 핸들러를 통해 state 설정 (`setStatus(’value’)`)

## 요약

- 선언형 프로그래밍은 시각적 state로 UI를 묘사함
- 고려할 점
  1. 모든 시각적 state 확인
  2. state 변화가 발생하는 트리거 확인
  3. `useState`로 state 모델링
  4. 불필요한 state 제거
  5. 이벤트 핸들러를 연결하여 state 설정
