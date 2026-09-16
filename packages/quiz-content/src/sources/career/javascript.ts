import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 script-spark — Variable */
const scriptSparkQuiz: readonly QuizQuestion[] = [
  question(
    ["재할당하지 않을 값을 담을 때 권장되는 선언 키워드는?", "Which keyword should hold a value you will not reassign?"],
    ["const", "let", "var", "static"]
  ),
  question(["블록 범위를 가지며 재할당이 가능한 선언 키워드는?", "Which keyword declares a block-scoped variable you can reassign?"], ["let", "const", "var", "def"]),
  question(
    ["var 대신 let과 const를 쓰는 이유는?", "Why prefer let and const over var?"],
    [["블록 범위를 지켜 예상치 못한 덮어쓰기를 줄인다", "They are block-scoped, which reduces accidental overwrites"], ["실행 속도가 몇 배 빨라진다", "They run several times faster"], ["타입을 자동으로 검사한다", "They check types automatically"], ["메모리를 직접 해제한다", "They free memory manually"]]
  ),
  question(["값을 할당하지 않고 선언만 한 변수의 값은?", "What is the value of a variable that is declared but never assigned?"], ["undefined", "null", "0", '""']),
  question(
    ["typeof null의 결과는?", "What does typeof null return?"],
    ['"object"', '"null"', '"undefined"', '"number"']
  ),
  question(
    ["다음 중 원시 타입이 아닌 것은?", "Which of these is NOT a primitive type?"],
    [["배열", "Array"], ["문자열", "String"], ["숫자", "Number"], ["불리언", "Boolean"]]
  ),
  question(
    ["=== 와 == 의 차이는?", "What is the difference between === and ==?"],
    [["===는 타입 변환 없이 비교한다", "=== compares without type coercion"], ["===는 항상 false를 반환한다", "=== always returns false"], ["==는 더 엄격한 비교다", "== is the stricter comparison"], ["둘은 완전히 같다", "They are exactly the same"]]
  ),
  question(
    ['const 객체를 선언한 뒤 obj.name = "새 이름"을 하면?', 'After declaring an object with const, what happens on obj.name = "new name"?'],
    [["속성 변경은 가능하므로 정상 동작한다", "It works, because properties can still change"], ["항상 오류가 발생한다", "It always throws an error"], ["변수 전체가 undefined가 된다", "The whole variable becomes undefined"], ["조용히 무시된다", "It is silently ignored"]]
  ),
  question(
    ["템플릿 리터럴로 변수를 문자열에 끼워 넣는 문법은?", "Which template literal syntax interpolates a variable?"],
    ["`Hello, ${name}`", '"Hello, $name"', "'Hello, {name}'", '"Hello, #{name}"']
  ),
  question(
    ["변수 이름을 지을 때 가장 좋은 습관은?", "What is the best habit when naming a variable?"],
    [["담긴 값의 의미를 드러내는 이름을 쓴다", "Use a name that reveals what the value means"], ["가능한 한 짧게 a, b로 쓴다", "Keep it as short as a or b"], ["전부 대문자로 쓴다", "Write it in all capitals"], ["타입을 접두사로 붙인다", "Prefix it with its type"]]
  ),
];

/** LV.2 callback-fox — Function */
const callbackFoxQuiz: readonly QuizQuestion[] = [
  question(
    ["함수를 사용하는 핵심 이유는?", "What is the core reason to use a function?"],
    [["같은 동작을 이름 붙여 재사용한다", "It names behavior so you can reuse it"], ["변수를 전역으로 만든다", "It makes variables global"], ["코드 줄 수를 항상 늘린다", "It always adds more lines"], ["실행 순서를 무작위로 만든다", "It randomizes execution order"]]
  ),
  question(["값을 돌려주지 않고 끝난 함수의 반환값은?", "What does a function return when it ends without returning a value?"], ["undefined", "null", "0", "NaN"]),
  question(
    ["다른 함수의 인자로 전달되어 나중에 실행되는 함수는?", "What is a function passed to another function to be called later?"],
    [["콜백 함수", "A callback function"], ["생성자 함수", "A constructor function"], ["즉시 실행 함수", "An immediately invoked function"], ["재귀 함수", "A recursive function"]]
  ),
  question(
    ["화살표 함수와 일반 함수의 중요한 차이는?", "What is an important difference between an arrow function and a regular function?"],
    [["화살표 함수는 자신만의 this를 갖지 않는다", "An arrow function has no this of its own"], ["화살표 함수는 인자를 받지 못한다", "An arrow function cannot take arguments"], ["화살표 함수는 값을 반환할 수 없다", "An arrow function cannot return a value"], ["화살표 함수는 항상 비동기다", "An arrow function is always asynchronous"]]
  ),
  question(
    ["매개변수에 값이 전달되지 않았을 때 쓸 값을 정하는 문법은?", "Which syntax sets the value used when an argument is not passed?"],
    ["function f(x = 1) {}", "function f(x || 1) {}", "function f(x ?? 1) {}", "function f(default x) {}"]
  ),
  question(
    ["콜백이 여러 단계로 겹쳐 읽기 어려워진 코드를 부르는 말은?", "What is deeply nested, hard-to-read callback code called?"],
    [["콜백 지옥", "Callback hell"], ["이벤트 루프", "The event loop"], ["클로저", "A closure"], ["호이스팅", "Hoisting"]]
  ),
  question(
    ["함수가 바깥 스코프의 변수를 기억하는 성질은?", "What is it called when a function remembers variables from its outer scope?"],
    [["클로저", "A closure"], ["상속", "Inheritance"], ["호이스팅", "Hoisting"], ["커링", "Currying"]]
  ),
  question(
    ["순수 함수(pure function)의 특징은?", "What characterizes a pure function?"],
    [["같은 입력에 항상 같은 출력을 내고 외부를 바꾸지 않는다", "It returns the same output for the same input and changes nothing outside"], ["항상 비동기로 실행된다", "It always runs asynchronously"], ["전역 변수를 반드시 수정한다", "It must modify a global variable"], ["반환값이 없어야 한다", "It must not return a value"]]
  ),
  question(
    ["배열의 각 요소를 변환해 새 배열을 만드는 메서드는?", "Which array method transforms each element into a new array?"],
    ["map", "forEach", "filter", "reduce"]
  ),
  question(
    ["함수 하나가 너무 많은 일을 할 때 권장되는 조치는?", "What is recommended when one function does too many things?"],
    [["역할별로 작은 함수로 나눈다", "Split it into smaller functions by responsibility"], ["주석을 더 길게 단다", "Write a longer comment"], ["매개변수를 더 늘린다", "Add more parameters"], ["전역 변수로 옮긴다", "Move it into global variables"]]
  ),
];

/** LV.3 event-spark — Event */
const eventSparkQuiz: readonly QuizQuestion[] = [
  question(["요소에 이벤트 처리기를 등록하는 표준 메서드는?", "Which standard method registers an event handler on an element?"], ["addEventListener", "onEvent", "attachHandler", "bindEvent"]),
  question(
    ["이벤트가 대상 요소에서 조상 요소로 거슬러 올라가는 단계는?", "What is the phase where an event travels from the target up to its ancestors?"],
    [["버블링", "Bubbling"], ["캡처링", "Capturing"], ["디스패치", "Dispatching"], ["프리벤팅", "Preventing"]]
  ),
  question(
    ["폼 제출 시 페이지 새로고침을 막는 메서드는?", "Which method stops a form submit from reloading the page?"],
    ["event.preventDefault()", "event.stopPropagation()", "event.cancel()", "return null"]
  ),
  question(
    ["이벤트가 상위로 전파되는 것을 멈추는 메서드는?", "Which method stops an event from propagating further up?"],
    ["event.stopPropagation()", "event.preventDefault()", "event.halt()", "event.stopDefault()"]
  ),
  question(
    ["부모에 처리기 하나만 달아 여러 자식의 이벤트를 처리하는 기법은?", "What technique handles many children's events with one parent handler?"],
    [["이벤트 위임", "Event delegation"], ["이벤트 중복", "Event duplication"], ["이벤트 캡처", "Event capture"], ["이벤트 폴링", "Event polling"]]
  ),
  question(["이벤트를 실제로 발생시킨 요소를 가리키는 속성은?", "Which property points at the element that actually fired the event?"], ["event.target", "event.currentTarget", "event.source", "event.origin"]),
  question(
    ["HTML이 모두 파싱된 직후 실행하고 싶을 때 듣는 이벤트는?", "Which event fires right after the HTML has finished parsing?"],
    ["DOMContentLoaded", "load", "ready", "render"]
  ),
  question(
    ["연속으로 발생하는 이벤트를 마지막 한 번만 처리하도록 지연시키는 기법은?", "Which technique delays a rapid burst of events so only the last one runs?"],
    [["디바운스", "Debounce"], ["스로틀", "Throttle"], ["폴링", "Polling"], ["캐싱", "Caching"]]
  ),
  question(
    ["일정 시간마다 한 번씩만 처리기를 실행시키는 기법은?", "Which technique lets a handler run at most once per interval?"],
    [["스로틀", "Throttle"], ["디바운스", "Debounce"], ["위임", "Delegation"], ["버블링", "Bubbling"]]
  ),
  question(
    ["등록한 이벤트 처리기를 나중에 제거하려면?", "How do you remove an event handler you registered?"],
    [["같은 함수 참조로 removeEventListener를 호출한다", "Call removeEventListener with the same function reference"], ["요소의 색을 바꾼다", "Change the element's color"], ["새 처리기를 하나 더 등록한다", "Register one more handler"], ["페이지를 새로고침한다", "Reload the page"]]
  ),
];

/** LV.4 promise-seer — Promise */
const promiseSeerQuiz: readonly QuizQuestion[] = [
  question(
    ["Promise를 가장 잘 설명한 것은?", "Which best describes a Promise?"],
    [["비동기 작업의 미래 성공 또는 실패를 나타내는 객체", "An object representing the future success or failure of async work"], ["즉시 값을 반환하는 함수", "A function that returns a value immediately"], ["반복문의 한 종류", "A kind of loop"], ["브라우저 전용 저장소", "A browser-only storage API"]]
  ),
  question(
    ["Promise가 가질 수 있는 상태가 아닌 것은?", "Which is NOT a Promise state?"],
    [["paused", "paused"], ["pending", "pending"], ["fulfilled", "fulfilled"], ["rejected", "rejected"]]
  ),
  question(["Promise가 성공했을 때 결과를 받는 메서드는?", "Which method receives the value when a Promise succeeds?"], [".then()", ".catch()", ".finally()", ".resolve()"]),
  question(["Promise가 실패했을 때 오류를 처리하는 메서드는?", "Which method handles the error when a Promise fails?"], [".catch()", ".then()", ".finally()", ".reject()"]),
  question(
    ["성공하든 실패하든 항상 실행되는 메서드는?", "Which method always runs, whether the Promise settles or fails?"],
    [".finally()", ".then()", ".catch()", ".always()"]
  ),
  question(
    ["여러 Promise를 동시에 시작하고 모두 성공하기를 기다리는 것은?", "Which starts several Promises at once and waits for all to succeed?"],
    ["Promise.all", "Promise.race", "Promise.any", "Promise.resolve"]
  ),
  question(
    ["여러 Promise 중 가장 먼저 끝난 하나의 결과를 취하는 것은?", "Which takes the result of whichever Promise settles first?"],
    ["Promise.race", "Promise.all", "Promise.allSettled", "Promise.reject"]
  ),
  question(
    ["실패한 것까지 포함해 모든 Promise의 결과를 전부 받고 싶다면?", "Which gives you every Promise's outcome, including the failures?"],
    ["Promise.allSettled", "Promise.all", "Promise.race", "Promise.any"]
  ),
  question(
    [".then() 안에서 또 Promise를 반환하면 어떻게 되나?", "What happens when you return another Promise inside .then()?"],
    [["다음 .then()이 그 Promise가 끝난 값을 받는다", "The next .then() receives the value that Promise settles with"], ["즉시 Promise 객체 자체가 전달된다", "The Promise object itself is passed straight through"], ["체인이 중단된다", "The chain stops"], ["오류가 발생한다", "An error is thrown"]]
  ),
  question(
    ["Promise 체인에 .catch()를 빠뜨리면 생기는 문제는?", "What problem comes from omitting .catch() in a Promise chain?"],
    [["처리되지 않은 거부가 발생해 오류를 놓친다", "An unhandled rejection slips by and the error is lost"], ["체인이 두 배 빨라진다", "The chain runs twice as fast"], ["자동으로 재시도된다", "It retries automatically"], ["Promise가 동기로 바뀐다", "The Promise becomes synchronous"]]
  ),
];

/** LV.5 async-oracle — async/await */
const asyncOracleQuiz: readonly QuizQuestion[] = [
  question(
    ["async 함수가 항상 반환하는 것은?", "What does an async function always return?"],
    [["Promise", "A Promise"], ["undefined", "undefined"], ["문자열", "A string"], ["콜백 함수", "A callback function"]]
  ),
  question(
    ["await를 사용할 수 있는 곳은?", "Where can you use await?"],
    [["async 함수 안 또는 모듈의 최상위", "Inside an async function, or at the top level of a module"], ["어떤 함수 안에서든", "Inside any function at all"], ["for 반복문 안에서만", "Only inside a for loop"], ["클래스 선언부에서만", "Only in a class declaration"]]
  ),
  question(
    ["async/await 코드에서 오류를 잡는 표준 방법은?", "What is the standard way to catch errors in async/await code?"],
    ["try / catch", "if / else", "switch / case", "do / while"]
  ),
  question(
    ["독립적인 두 요청을 await로 한 줄씩 기다리면 생기는 문제는?", "What goes wrong when you await two independent requests one line at a time?"],
    [["동시에 할 수 있는 작업이 순차로 실행돼 느려진다", "Work that could run in parallel runs sequentially and gets slower"], ["둘 다 실행되지 않는다", "Neither one runs"], ["항상 오류가 발생한다", "It always throws"], ["결과 순서가 뒤바뀐다", "The results come back out of order"]]
  ),
  question(
    ["독립적인 두 비동기 작업을 동시에 기다리는 올바른 방법은?", "What is the correct way to await two independent async tasks together?"],
    ["await Promise.all([a(), b()])", "await a(); await b();", "Promise.all([await a(), await b()])", "await [a(), b()]"]
  ),
  question(
    ["async 함수 안에서 던진 오류는 어떻게 전달되나?", "How does an error thrown inside an async function surface?"],
    [["반환된 Promise가 거부된다", "The returned Promise rejects"], ["프로그램이 즉시 종료된다", "The program exits immediately"], ["조용히 무시된다", "It is silently swallowed"], ["동기 예외로 즉시 던져진다", "It is thrown synchronously right away"]]
  ),
  question(
    ["forEach 콜백 안에서 await를 쓰면 생기는 일은?", "What happens when you use await inside a forEach callback?"],
    [["forEach가 기다리지 않아 완료 전에 다음 코드가 실행된다", "forEach does not wait, so the next code runs before completion"], ["자동으로 순차 실행된다", "It runs sequentially by itself"], ["문법 오류가 발생한다", "It is a syntax error"], ["Promise.all과 같아진다", "It behaves like Promise.all"]]
  ),
  question(
    ["여러 항목을 순서대로 하나씩 처리해야 할 때 알맞은 것은?", "Which fits when items must be processed strictly one after another?"],
    [["for...of 안에서 await", "await inside a for...of loop"], ["Promise.all", "Promise.all"], ["Promise.race", "Promise.race"], ["setTimeout 반복", "Repeated setTimeout"]]
  ),
  question(
    ["await가 동기 코드와 다른 점은?", "How does await differ from synchronous blocking?"],
    [["호출 스택을 막지 않고 나머지 작업이 계속 돌아간다", "It does not block the call stack, so other work keeps running"], ["브라우저 전체를 멈춘다", "It freezes the whole browser"], ["새 스레드를 만든다", "It creates a new thread"], ["CPU 사용을 차단한다", "It blocks CPU usage"]]
  ),
  question(
    ["콜백 체인 대신 async/await를 쓰는 주된 이점은?", "What is the main benefit of async/await over a callback chain?"],
    [["비동기 흐름을 위에서 아래로 읽히게 쓴다", "Async flow reads top to bottom"], ["네트워크 속도가 빨라진다", "The network gets faster"], ["오류가 생기지 않는다", "Errors stop happening"], ["코드가 자동으로 병렬 실행된다", "Code runs in parallel automatically"]]
  ),
];

const javascriptQuiz: readonly (readonly QuizQuestion[])[] = [
  scriptSparkQuiz,
  callbackFoxQuiz,
  eventSparkQuiz,
  promiseSeerQuiz,
  asyncOracleQuiz,
];

export default javascriptQuiz;
