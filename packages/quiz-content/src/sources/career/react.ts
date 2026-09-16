import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 state-sprout — Component */
const stateSproutQuiz: readonly QuizQuestion[] = [
  question(
    ["React 컴포넌트가 하는 일은?", "What does a React component do?"],
    [["UI를 독립적이고 재사용 가능한 단위로 나눈다", "It splits the UI into independent, reusable units"], ["데이터베이스를 조회한다", "It queries the database"], ["서버를 실행한다", "It runs the server"], ["CSS 파일을 생성한다", "It generates CSS files"]]
  ),
  question(
    ["함수 컴포넌트가 반환해야 하는 것은?", "What must a function component return?"],
    [["렌더링할 React 요소 또는 null", "React elements to render, or null"], ["항상 문자열", "A string, always"], ["Promise 객체", "A Promise"], ["아무것도 반환하지 않아야 한다", "Nothing at all"]]
  ),
  question(
    ["컴포넌트 이름을 대문자로 시작해야 하는 이유는?", "Why must a component name start with a capital letter?"],
    [["소문자는 HTML 태그로 해석되기 때문이다", "Lowercase names are treated as HTML tags"], ["가독성 때문일 뿐이다", "It is purely a readability convention"], ["파일 이름과 맞추기 위해서다", "To match the file name"], ["타입 검사 때문이다", "Because of type checking"]]
  ),
  question(
    ["JSX에서 class 대신 쓰는 속성 이름은?", "Which attribute replaces class in JSX?"],
    ["className", "class", "cssClass", "styleName"]
  ),
  question(
    ["JSX에서 여러 요소를 감쌀 때 불필요한 div를 피하는 방법은?", "How do you wrap sibling elements in JSX without an extra div?"],
    [["프래그먼트를 쓴다", "Use a Fragment"], ["span으로 감싼다", "Wrap them in a span"], ["배열 문자열로 만든다", "Join them into a string"], ["감쌀 필요가 없다", "No wrapper is ever needed"]]
  ),
  question(
    ["컴포넌트를 작게 나누면 좋은 이유는?", "Why split components into smaller pieces?"],
    [["역할이 분명해져 재사용과 테스트가 쉬워진다", "Responsibilities stay clear, so reuse and testing get easier"], ["렌더링이 항상 빨라진다", "Rendering always gets faster"], ["번들 크기가 줄어든다", "The bundle always shrinks"], ["상태가 필요 없어진다", "State becomes unnecessary"]]
  ),
  question(
    ["JSX 안에서 자바스크립트 식을 넣는 문법은?", "Which syntax embeds a JavaScript expression in JSX?"],
    ["{value}", "${value}", "<%= value %>", "{{value}}"]
  ),
  question(
    ["조건에 따라 요소를 렌더링하지 않으려면?", "How do you render nothing under a condition?"],
    [["null을 반환한다", "Return null"], ["빈 문자열을 반환한다", "Return an empty string"], ["undefined를 던진다", "Throw undefined"], ["false를 상태에 저장한다", "Store false in state"]]
  ),
  question(
    ["React가 UI를 갱신할 때 실제 DOM 조작을 줄이는 방식은?", "How does React minimize real DOM work when updating?"],
    [["가상 DOM을 비교해 달라진 부분만 반영한다", "It diffs a virtual DOM and applies only the differences"], ["전체 페이지를 새로 그린다", "It repaints the entire page"], ["CSS만 바꾼다", "It only changes CSS"], ["서버에서 HTML을 다시 받는다", "It refetches HTML from the server"]]
  ),
  question(
    ["컴포넌트를 순수하게 유지한다는 말의 뜻은?", "What does keeping a component pure mean?"],
    [["같은 입력이면 렌더 중 같은 결과를 내고 부수 효과를 만들지 않는다", "The same input renders the same output, with no side effects during render"], ["항상 상태를 사용하지 않는다", "It never uses state at all"], ["항상 클래스여야 한다", "It must always be a class"], ["항상 비동기여야 한다", "It must always be asynchronous"]]
  ),
];

/** LV.2 prop-pair — Props */
const propPairQuiz: readonly QuizQuestion[] = [
  question(
    ["props가 하는 일은?", "What do props do?"],
    [["부모가 자식에게 읽기 전용 값을 전달한다", "They pass read-only values from a parent to a child"], ["자식이 부모의 값을 직접 수정한다", "They let a child edit the parent's values directly"], ["전역 상태를 저장한다", "They store global state"], ["서버와 통신한다", "They talk to the server"]]
  ),
  question(
    ["자식 컴포넌트가 받은 props를 직접 수정하면?", "What if a child modifies the props it received?"],
    [["props는 읽기 전용이므로 해서는 안 된다", "Props are read-only, so it must not happen"], ["부모의 상태가 자동으로 바뀐다", "The parent's state updates automatically"], ["다음 렌더에 반영된다", "It applies on the next render"], ["아무 문제가 없다", "Nothing is wrong with it"]]
  ),
  question(
    ["자식에서 부모로 변화를 알리는 일반적인 방법은?", "How does a child usually tell its parent something changed?"],
    [["부모가 내려준 콜백 함수를 호출한다", "It calls a callback function the parent passed down"], ["부모의 변수를 직접 바꾼다", "It edits the parent's variable directly"], ["전역 변수를 수정한다", "It mutates a global variable"], ["페이지를 새로고침한다", "It reloads the page"]]
  ),
  question(
    ["여는 태그와 닫는 태그 사이의 내용을 받는 특별한 prop은?", "Which special prop receives the content between the tags?"],
    ["children", "content", "slot", "inner"]
  ),
  question(
    ["prop을 여러 단계 아래로 계속 내려보내는 문제를 부르는 말은?", "What is passing a prop down through many layers called?"],
    [["프롭 드릴링", "Prop drilling"], ["리프팅", "Lifting"], ["메모이제이션", "Memoization"], ["하이드레이션", "Hydration"]]
  ),
  question(
    ["여러 자식이 같은 값을 써야 할 때 권장되는 방법은?", "What is recommended when several children need the same value?"],
    [["공통 부모로 상태를 끌어올린다", "Lift the state up to their common parent"], ["각자 복사해서 따로 관리한다", "Copy it into each child separately"], ["전역 변수에 넣는다", "Put it in a global variable"], ["DOM에서 읽는다", "Read it from the DOM"]]
  ),
  question(
    ["prop이 전달되지 않았을 때 쓸 값을 정하는 방법은?", "How do you define a value used when a prop is not passed?"],
    [["구조 분해에서 기본값을 지정한다", "Give it a default in the destructuring"], ["컴포넌트 밖에서 전역으로 정한다", "Define it globally outside the component"], ["렌더 중에 상태로 저장한다", "Store it in state during render"], ["기본값은 지정할 수 없다", "Defaults are not possible"]]
  ),
  question(
    ["props로 함수를 내려줄 때 주의할 점은?", "What deserves care when passing a function as a prop?"],
    [["매 렌더마다 새 함수가 만들어져 불필요한 렌더를 부를 수 있다", "A new function each render can trigger unnecessary re-renders"], ["함수는 prop으로 전달할 수 없다", "Functions cannot be passed as props"], ["항상 비동기가 된다", "It always becomes asynchronous"], ["자식이 함수를 수정한다", "The child rewrites the function"]]
  ),
  question(
    ["컴포넌트에 전달되는 값의 형태를 문서화하는 방법은?", "How do you document the shape of a component's inputs?"],
    [["타입 정의로 props 인터페이스를 선언한다", "Declare a typed props interface"], ["주석만 남긴다", "Leave only a comment"], ["변수 이름을 길게 짓는다", "Use very long variable names"], ["문서화하지 않는다", "Do not document it"]]
  ),
  question(
    ["props가 너무 많아졌을 때 고려할 것은?", "What should you consider when a component takes too many props?"],
    [["컴포넌트를 나누거나 관련 값을 객체로 묶는다", "Split the component, or group related values into one object"], ["props를 전역 변수로 바꾼다", "Convert the props into globals"], ["모두 선택적으로 만든다", "Make them all optional"], ["순서를 알파벳으로 정렬한다", "Sort them alphabetically"]]
  ),
];

/** LV.3 component-weaver — State */
const componentWeaverQuiz: readonly QuizQuestion[] = [
  question(
    ["state를 가장 잘 설명한 것은?", "Which best describes state?"],
    [["컴포넌트가 기억하며 바뀌면 다시 렌더링되는 값", "Data a component remembers that re-renders it when changed"], ["부모가 내려주는 읽기 전용 값", "A read-only value passed by the parent"], ["CSS 클래스 이름", "A CSS class name"], ["서버의 응답 코드", "The server's status code"]]
  ),
  question(
    ["함수 컴포넌트에서 상태를 선언하는 훅은?", "Which hook declares state in a function component?"],
    ["useState", "useEffect", "useRef", "useMemo"]
  ),
  question(
    ["상태 값을 직접 대입해 바꾸면?", "What happens if you assign to the state variable directly?"],
    [["React가 변화를 알지 못해 다시 렌더링되지 않는다", "React does not notice the change and never re-renders"], ["즉시 화면이 갱신된다", "The screen updates immediately"], ["오류가 발생한다", "It throws an error"], ["다음 렌더에서 자동 반영된다", "It applies on the next render automatically"]]
  ),
  question(
    ["이전 값을 바탕으로 상태를 갱신할 때 안전한 방법은?", "What is the safe way to update state based on its previous value?"],
    [["갱신 함수를 전달한다", "Pass an updater function"], ["현재 변수를 직접 더한다", "Add to the current variable directly"], ["setTimeout으로 지연시킨다", "Delay it with setTimeout"], ["상태를 두 개로 나눈다", "Split it into two states"]]
  ),
  question(
    ["React에서 상태 갱신이 비동기적으로 묶이는 것을 부르는 말은?", "What is it called when React groups state updates together?"],
    [["배칭", "Batching"], ["하이드레이션", "Hydration"], ["리컨실리에이션", "Reconciliation"], ["서스펜스", "Suspense"]]
  ),
  question(
    ["배열 상태에 항목을 추가하는 올바른 방법은?", "What is the correct way to add an item to array state?"],
    [["새 배열을 만들어 설정한다", "Create a new array and set it"], ["push로 기존 배열을 바꾼다", "Mutate the existing array with push"], ["index로 직접 대입한다", "Assign by index directly"], ["length를 늘린다", "Increase its length"]]
  ),
  question(
    ["다른 상태에서 계산할 수 있는 값을 상태로 두면?", "What is wrong with storing a value that can be derived from other state?"],
    [["두 값이 어긋날 수 있어 렌더 중 계산하는 편이 낫다", "The two can fall out of sync; computing during render is safer"], ["렌더가 빨라진다", "Rendering gets faster"], ["코드가 짧아진다", "The code gets shorter"], ["문제가 없다", "Nothing is wrong"]]
  ),
  question(
    ["여러 컴포넌트가 공유해야 하는 상태의 위치는?", "Where should state shared by several components live?"],
    [["가장 가까운 공통 부모", "In their nearest common parent"], ["각 컴포넌트 안에 복사", "Copied inside each component"], ["항상 전역 저장소", "Always in a global store"], ["DOM 속성", "In a DOM attribute"]]
  ),
  question(
    ["props를 초기값으로 상태에 복사했을 때의 문제는?", "What is the problem with copying a prop into initial state?"],
    [["이후 props가 바뀌어도 상태가 따라가지 않는다", "Later prop changes never reach the state"], ["렌더가 멈춘다", "Rendering stops"], ["타입이 바뀐다", "The type changes"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["상태가 복잡한 전이 규칙을 가질 때 알맞은 훅은?", "Which hook fits state with complex transition rules?"],
    ["useReducer", "useRef", "useId", "useContext"]
  ),
];

/** LV.4 hook-conductor — Hook */
const hookConductorQuiz: readonly QuizQuestion[] = [
  question(
    ["훅이 하는 일은?", "What do hooks do?"],
    [["함수 컴포넌트에서 상태와 생명주기 기능을 쓰게 한다", "They give function components state and lifecycle features"], ["CSS를 생성한다", "They generate CSS"], ["서버를 실행한다", "They run a server"], ["HTML을 파싱한다", "They parse HTML"]]
  ),
  question(
    ["훅을 호출할 수 있는 위치는?", "Where may a hook be called?"],
    [["컴포넌트나 커스텀 훅의 최상위", "At the top level of a component or custom hook"], ["조건문 안", "Inside an if statement"], ["반복문 안", "Inside a loop"], ["이벤트 핸들러 안", "Inside an event handler"]]
  ),
  question(
    ["훅을 조건문 안에서 호출하면 안 되는 이유는?", "Why must hooks not be called conditionally?"],
    [["React가 호출 순서로 훅을 구분하기 때문이다", "React identifies hooks by their call order"], ["문법 오류이기 때문이다", "It is a syntax error"], ["성능이 느려지기 때문이다", "It is slower"], ["타입 검사가 실패하기 때문이다", "Type checking fails"]]
  ),
  question(
    ["렌더 이후 외부 시스템과 동기화할 때 쓰는 훅은?", "Which hook synchronizes with an external system after render?"],
    ["useEffect", "useMemo", "useCallback", "useState"]
  ),
  question(
    ["useEffect의 의존성 배열이 비어 있으면?", "What does an empty dependency array mean for useEffect?"],
    [["마운트된 뒤 한 번만 실행된다", "The effect runs once, after mount"], ["매 렌더마다 실행된다", "It runs on every render"], ["절대 실행되지 않는다", "It never runs"], ["언마운트 때만 실행된다", "It runs only on unmount"]]
  ),
  question(
    ["useEffect에서 반환한 함수가 하는 일은?", "What does the function returned from useEffect do?"],
    [["구독 해제 같은 정리 작업을 한다", "It cleans up, for example by unsubscribing"], ["다음 렌더 값을 결정한다", "It decides the next render's value"], ["상태를 저장한다", "It stores state"], ["컴포넌트를 다시 그린다", "It repaints the component"]]
  ),
  question(
    ["의존성 배열에 필요한 값을 빠뜨리면?", "What happens when a dependency is left out of the array?"],
    [["오래된 값을 계속 참조하는 버그가 생긴다", "The effect keeps reading stale values"], ["렌더가 빨라진다", "Rendering gets faster"], ["오류가 발생한다", "It throws an error"], ["자동으로 추가된다", "React adds it automatically"]]
  ),
  question(
    ["비싼 계산 결과를 렌더 사이에 기억하는 훅은?", "Which hook remembers an expensive computation between renders?"],
    ["useMemo", "useEffect", "useRef", "useReducer"]
  ),
  question(
    ["값이 바뀌어도 다시 렌더링을 일으키지 않는 저장소 훅은?", "Which hook stores a value without triggering a re-render?"],
    ["useRef", "useState", "useMemo", "useContext"]
  ),
  question(
    ["여러 컴포넌트에서 쓰는 훅 로직을 묶는 방법은?", "How do you share hook logic across components?"],
    [["use로 시작하는 커스텀 훅으로 추출한다", "Extract it into a custom hook named with a use prefix"], ["전역 함수로 복사한다", "Copy it into a global function"], ["클래스로 바꾼다", "Convert it to a class"], ["각 컴포넌트에 붙여넣는다", "Paste it into every component"]]
  ),
];

/** LV.5 component-architect — Key */
const componentArchitectQuiz: readonly QuizQuestion[] = [
  question(
    ["목록 렌더링에서 key가 하는 일은?", "What does a key do when rendering a list?"],
    [["React가 항목의 정체성을 안정적으로 추적하게 한다", "It lets React track each item's identity reliably"], ["항목을 정렬한다", "It sorts the items"], ["항목에 스타일을 준다", "It styles the items"], ["항목 수를 센다", "It counts the items"]]
  ),
  question(
    ["key로 가장 알맞은 값은?", "Which makes the best key?"],
    [["항목마다 고유하고 변하지 않는 식별자", "An identifier unique to the item and stable over time"], ["배열의 인덱스", "The array index"], ["무작위로 생성한 값", "A freshly generated random value"], ["항목의 표시 이름", "The item's display name"]]
  ),
  question(
    ["key에 배열 인덱스를 쓰면 생기는 문제는?", "What breaks when the array index is used as a key?"],
    [["순서가 바뀌면 잘못된 항목에 상태가 남는다", "Reordering leaves state attached to the wrong item"], ["렌더가 멈춘다", "Rendering stops"], ["문법 오류가 발생한다", "It is a syntax error"], ["항목이 사라진다", "Items disappear"]]
  ),
  question(
    ["렌더마다 새로 만든 값을 key로 쓰면?", "What happens if a key is regenerated on every render?"],
    [["매번 새 요소로 취급돼 상태가 초기화된다", "React treats it as a new element each time and resets its state"], ["성능이 좋아진다", "Performance improves"], ["React가 경고를 없앤다", "React stops warning"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["컴포넌트에 key를 일부러 바꿔 주는 것이 유용한 경우는?", "When is deliberately changing a component's key useful?"],
    [["내부 상태를 완전히 초기화하고 싶을 때", "When you want to reset its internal state completely"], ["스타일을 바꾸고 싶을 때", "When you want to change its style"], ["props를 늘리고 싶을 때", "When you want to add props"], ["렌더를 건너뛰고 싶을 때", "When you want to skip rendering"]]
  ),
  question(
    ["key는 어디에 붙여야 하나?", "Where must a key be placed?"],
    [["반복해서 만들어지는 최상위 요소", "On the outermost element produced by the loop"], ["가장 안쪽 자식 요소", "On the innermost child"], ["부모 컨테이너", "On the parent container"], ["어디든 상관없다", "Anywhere at all"]]
  ),
  question(
    ["React가 이전 트리와 새 트리를 비교하는 과정을 부르는 말은?", "What is React's process of comparing the old and new trees called?"],
    [["리컨실리에이션", "Reconciliation"], ["하이드레이션", "Hydration"], ["배칭", "Batching"], ["마운팅", "Mounting"]]
  ),
  question(
    ["props가 같을 때 자식의 재렌더를 건너뛰게 하는 것은?", "What lets React skip re-rendering a child whose props are unchanged?"],
    ["React.memo", "useEffect", "useRef", "React.lazy"]
  ),
  question(
    ["무작정 메모이제이션을 남발하면 생기는 문제는?", "What is the downside of memoizing everything?"],
    [["비교 비용과 복잡도가 이득을 넘어설 수 있다", "The comparison cost and complexity can outweigh the benefit"], ["렌더가 멈춘다", "Rendering stops"], ["상태가 사라진다", "State disappears"], ["항상 더 빨라진다", "It always gets faster"]]
  ),
  question(
    ["React 성능 문제를 다룰 때 올바른 순서는?", "What is the right order for tackling a React performance problem?"],
    [["프로파일러로 측정한 뒤 병목만 최적화한다", "Measure with the profiler, then optimize only the bottleneck"], ["모든 컴포넌트를 먼저 메모이제이션한다", "Memoize every component first"], ["상태를 전부 전역으로 옮긴다", "Move all state into a global store"], ["컴포넌트를 하나로 합친다", "Merge everything into one component"]]
  ),
];

const reactQuiz: readonly (readonly QuizQuestion[])[] = [
  stateSproutQuiz,
  propPairQuiz,
  componentWeaverQuiz,
  hookConductorQuiz,
  componentArchitectQuiz,
];

export default reactQuiz;
