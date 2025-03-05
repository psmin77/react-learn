## Reducer와 context 결합하기

- 최상위 컴포넌트에서 state와 dispatch 함수를 선언한다면, 하위 컴포넌트에는 명시적으로 props를 전달해야 함 → 프로젝트가 커지면 복잡해질 수 있음
- Reducer와 context 결합 방법
  1. Context 생성
  2. State와 dispatch 함수를 context에 넣기
  3. 트리 안에서 context 생성

### 1단계: Context 생성

- 두 개의 별도 context를 생성해야 함
  - `TasksContext` : `tasks` 리스트 제공
  - `TasksDispatchContext` : action을 dispatch 하는 함수 제공

```jsx
import { createContext } from "react";

export const TasksContext = createContext(null);
export const TasksDispatchContext = createContext(null);
```

### 2단계: State와 dispatch 함수를 context에 넣기

- 컴포넌트에서 `useReducer()`로 반환된 `tasks`와 `dispatch`를 가져와서 트리 전체에 context value로 제공

```jsx
import { TasksContext, TasksDispatchContext } from "./TasksContext.js";

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  // ...
  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        ...
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}
```

### 3단계: 트리 안에서 context 사용하기

- `useContext(TasksContext)`, `useContext(TasksDispatchContext)`로 context를 가져와서 사용

```jsx
export default function AddTask({ onAddTask }) {
  const [text, setText] = useState('');
  const dispatch = useContext(TasksDispatchContext);
  // ...
  return (
    // ...
    <button onClick={() => {
      setText('');
      dispatch({
        type: 'added',
        id: nextId++,
        text: text,
      });
    }}>Add</button>
    // ...
```

## 하나의 파일로 합치기

- Reducer와 Context를 모두 하나의 파일로 통합
  - Reducer로 state 관리
  - 두 context를 모두 하위 컴포넌트에 제공
  - `children`을 props로 받아 JSX 전달
  - `use` 함수도 반환 가능 → **사용자 정의 Hook**

```jsx
// TaskContext.js
const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}

export function useTasksDispatch() {
  return useContext(TasksDispatchContext);
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case "added": {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case "changed": {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case "deleted": {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

const initialTasks = [
  { id: 0, text: "Philosopher’s Path", done: true },
  { id: 1, text: "Visit the temple", done: false },
  { id: 2, text: "Drink matcha", done: false },
];

// App.js
export default function TaskApp() {
  return (
    <TasksProvider>
      <h1>Day off in Kyoto</h1>
      <AddTask />
      <TaskList />
    </TasksProvider>
  );
}
```

## 요약

- Reducer와 context를 결합해서 상위 state를 읽고 수정할 수 있음
- State와 dispatch 함수를 하위 컴포넌트에 제공하는 방법
  1. 두 개의 context 생성 (state와 dispatch)
  2. Reducer를 사용하는 컴포넌트에 두 개의 context를 모두 제공
  3. 하위 컴포넌트에서 필요한 context 사용
- 하나의 파일로 통합
  - Context를 제공하는 `TasksProvider` 와 같은 컴포넌트로 통합
  - `useTasks`와 `useTasksDispatch` 같은 사용자 Hook 반환 가능
- context-reducer 조합은 여러 개 가능
