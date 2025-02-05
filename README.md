## 1. 개요

### 초기 코드 살펴보기

- `App.js`
  - JSX 엘리먼트를 통해 컴포넌트 생성
- `styles.css`
  - 스타일 정의
- `index.js`
  - `App.js` 파일의 컴포넌트와 웹 브라우저 사이의 다리 역할
  - 필요한 모든 코드를 한 곳으로 가져옴
    - React
    - React DOM
    - 컴포넌트 스타일
    - `App.js` 컴포넌트

### 보드 만들기

### props를 통해 데이터 전달하기

### 사용자와 상호작용하는 컴포넌트 만들기

### React 개발자 도구

## 2. 게임 완료하기

### state 끌어올리기

- props로 함수를 '전달' 해야 함
- 사용자가 action 할 때까지 함수 '호출'하면 안 됨

### 불변성이 왜 중요할까요

- 원본 데이터를 직접 변형하지 않고 복사본으로 데이터 대체하도록 권장
- 이전 버전의 데이터를 그대로 유지하여 재사용하거나 초기화 할 수 있음
- 효율적인 리렌더링 관리
  - 새로운 메모리 주소가 할당되므로 React가 변경을 쉽게 감지
  - `Object.is()` 또는 얕은 비교로도 변경 감지 가능
  - 이전 상태와 새로운 상태를 비교하기 쉬움

### 순서 정하기

### 승자 결정하기

## 3. 시간여행 추가하기

### 이동 히스토리 저장하기

### 한 번 더 state 끌어올리기

### 과거 움직임 보여주기

### Key 선택하기

### 시간여행 구현하기

### 최종 정리

### 마무리
