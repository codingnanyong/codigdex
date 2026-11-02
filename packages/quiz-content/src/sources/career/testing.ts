import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 check-scout — Unit test */
const checkScoutQuiz: readonly QuizQuestion[] = [
  question(
    ["배송비 계산 함수만 빠르게 검사하고 결제 서버는 부르지 않으려 한다. 테스트 범위는?", "You want to test a shipping-fee function quickly without calling the payment server. What scope fits?"],
    [["격리된 작은 코드 단위", "One small, isolated unit of code"], ["배포된 전체 시스템", "The whole deployed system"], ["사용자 인터페이스 디자인", "The user interface design"], ["서버의 네트워크 설정", "The server's network configuration"]]
  ),
  question(
    ["배송비 수정 뒤 작은 계산 테스트가 즉시 실패했다. 이 테스트가 결함 조사에 주는 이점은?", "A small calculation test fails immediately after a shipping-fee change. How does it help investigate the defect?"],
    [["빠르게 실행돼 결함 위치를 좁혀 준다", "They run fast and narrow down where a defect lives"], ["배포를 자동화한다", "They automate deployment"], ["코드를 더 짧게 만든다", "They make code shorter"], ["문서를 대신 작성한다", "They write the documentation"]]
  ),
  question(
    ["장바구니를 만들고 합계 함수를 호출한 뒤 기대 합계를 비교하려 한다. 이 순서를 부르는 말은?", "You create a cart, call its total function, and compare with an expected total. What names these phases?"],
    [["준비 → 실행 → 검증", "Arrange → act → assert"], ["실행 → 준비 → 정리", "Act → arrange → clean up"], ["검증 → 실행 → 준비", "Assert → act → arrange"], ["배포 → 실행 → 롤백", "Deploy → act → roll back"]]
  ),
  question(
    ["팀이 배송비 단위 테스트의 품질 기준을 정한다. 피해야 할 기준은?", "A team sets quality criteria for its shipping-fee unit tests. Which criterion should it avoid?"],
    [["실행할 때마다 결과가 달라진다", "Its result changes from run to run"], ["빠르게 끝난다", "It finishes quickly"], ["다른 테스트와 독립적이다", "It is independent of other tests"], ["실패 원인이 분명하다", "Its failure reason is obvious"]]
  ),
  question(
    ["무료 배송 경계값에서 실패한 테스트를 이름만 보고 이해하려 한다. 이름에 담을 정보는?", "You want a test name to explain a failure at the free-shipping boundary. What should it describe?"],
    [["어떤 상황에서 무엇을 기대하는지 드러낸다", "State the situation and the expected outcome"], ["번호만 붙인다", "Number them sequentially"], ["함수 이름을 그대로 쓴다", "Copy the function name verbatim"], ["가능한 짧게 한 단어로 쓴다", "Use one word, as short as possible"]]
  ),
  question(
    ["새 할인 규칙의 실패 테스트를 먼저 만들고 통과하는 구현을 작성한 뒤 정리한다. 이 개발 주기는?", "You write a failing test for a discount rule, implement it, then refactor. Which development cycle is this?"],
    ["TDD", "CI", "BDD", "DDD"]
  ),
  question(
    ["테스트 보고서에서 할인 함수의 어느 줄이 실행됐는지 확인하려 한다. 어떤 지표를 볼까?", "A test report should show which lines of the discount function ran. Which metric should you inspect?"],
    [["코드 커버리지", "Code coverage"], ["순환 복잡도", "Cyclomatic complexity"], ["처리량", "Throughput"], ["기술 부채", "Technical debt"]]
  ),
  question(
    ["모든 줄이 실행돼 줄 커버리지는 100%지만 할인 합계를 잘못 비교한다. 이 지표가 보장하지 않는 것은?", "Line coverage is 100%, but a test compares against the wrong discounted total. What does coverage fail to guarantee?"],
    [["동작과 기대값이 올바르다는 것", "That the behavior and expected values are correct"], ["측정된 모든 줄이 실행됐다는 것", "That every measured line was executed"], ["실행된 줄이 집계됐다는 것", "That executed lines were counted"], ["줄 실행 비율이 100%라는 것", "That the measured line execution ratio is 100%"]]
  ),
  question(
    ["빈 장바구니에서 합계가 음수가 되는 버그를 받았다. 재발 방지를 위한 수정 순서는?", "A bug makes an empty cart total negative. Which repair order helps prevent recurrence?"],
    [["버그를 재현하는 테스트를 먼저 쓰고 고친다", "Write a test that reproduces it, then fix it"], ["고친 뒤 테스트는 생략한다", "Fix it and skip the test"], ["테스트를 지우고 고친다", "Delete the test and then fix it"], ["로그만 추가한다", "Just add a log line"]]
  ),
  question(
    ["코드를 바꾸지 않았는데 같은 테스트가 재실행하면 가끔 통과하고 가끔 실패한다. 이 현상은?", "Without code changes, rerunning the same test sometimes passes and sometimes fails. What is this called?"],
    [["플레이키 테스트", "A flaky test"], ["회귀 테스트", "A regression test"], ["연기 테스트", "A smoke test"], ["부하 테스트", "A load test"]]
  ),
];

/** LV.2 case-inspector — Assertion */
const caseInspectorQuiz: readonly QuizQuestion[] = [
  question(
    ["합계 함수를 호출한 뒤 결과가 3000인지 판정해야 한다. 단언이 맡는 일은?", "After calling a total function, a test must decide whether the result is 3000. What does its assertion do?"],
    [["실제 결과가 기대 결과와 같은지 판정한다", "It decides whether the actual result matches the expected one"], ["코드를 실행한다", "It runs the code"], ["테스트 데이터를 만든다", "It creates test data"], ["로그를 저장한다", "It stores logs"]]
  ),
  question(
    ["함수가 잘못된 합계를 반환해도 예외를 던지지 않아 테스트가 통과한다. 결과 단언을 빠뜨린 문제는?", "A function returns the wrong total without throwing, so its test passes. What is the missing result assertion allowing?"],
    [["오류 없이 끝나기만 하면 통과해 버린다", "It passes as long as nothing throws"], ["실행 속도가 느려진다", "It runs slowly"], ["문법 오류가 된다", "It is a syntax error"], ["커버리지가 0이 된다", "Coverage drops to zero"]]
  ),
  question(
    ["가입·주문·환불을 한 테스트에 넣어 실패한 기능을 찾기 어렵다. 관련 없는 검사를 나눠야 하는 이유는?", "One test combines signup, orders and refunds, making the broken feature hard to locate. Why separate unrelated checks?"],
    [["실패 원인이 무엇인지 알기 어려워진다", "It gets hard to tell what actually failed"], ["실행되지 않는다", "It stops running"], ["커버리지가 낮아진다", "Coverage drops"], ["항상 통과한다", "It always passes"]]
  ),
  question(
    ["0.1 + 0.2를 0.3과 정확히 같다고 단언하니 실패했다. 수치 비교를 어떻게 고칠까?", "An exact assertion that 0.1 + 0.2 equals 0.3 fails. How should this numerical comparison change?"],
    [["정확히 같은지 대신 허용 오차로 비교한다", "Compare within a tolerance instead of exact equality"], ["문자열로 바꿔 비교한다", "Convert to strings and compare"], ["항상 정수로 반올림한다", "Always round to integers"], ["비교하지 않는다", "Do not compare at all"]]
  ),
  question(
    ["서로 새로 만든 두 주문 객체의 중첩 필드 값이 같은지 검사한다. 어떤 비교가 필요한가?", "Two separately created order objects should contain equal nested field values. Which comparison is needed?"],
    [["깊은 비교", "A deep comparison"], ["참조 비교", "A reference comparison"], ["길이 비교", "A length comparison"], ["타입 비교", "A type comparison"]]
  ),
  question(
    ["잘못된 수량을 넘긴 동기 함수가 예외를 던지는지 검사하려 한다. 호출을 어떻게 전달할까?", "A synchronous function should throw for an invalid quantity. How should its call be passed to the assertion?"],
    [["실행을 함수로 감싸 던져지는지 확인한다", "Wrap the call in a function and assert that it throws"], ["결과를 문자열로 비교한다", "Compare the result as a string"], ["try 없이 그냥 호출한다", "Just call it without try"], ["로그를 확인한다", "Read the logs"]]
  ),
  question(
    ["CI에 '합계 오류'만 남아 원인을 알기 어렵다. 실패 메시지에 추가할 정보는?", "CI only reports 'total error', making diagnosis difficult. What should the failure message include?"],
    [["기대값과 실제값을 함께 보여 준다", "Both the expected and the actual value"], ["스택 트레이스만", "Only a stack trace"], ["테스트 번호만", "Only the test number"], ["아무 정보도 필요 없다", "No information is needed"]]
  ),
  question(
    ["주문이 반환된 경우에만 단언하도록 if로 감쌌다. 주문이 없는데도 통과하는 원인은?", "An if statement runs assertions only when an order is returned. Why does the test pass when no order exists?"],
    [["조건이 거짓이면 검증 없이 통과해 버린다", "If the condition is false the test passes unchecked"], ["문법 오류가 발생한다", "It causes a syntax error"], ["실행이 느려진다", "It slows execution"], ["커버리지가 중복 계산된다", "Coverage is double counted"]]
  ),
  question(
    ["양수 수량 3만 검사했더니 0과 음수 주문 버그를 놓쳤다. 추가할 검증 범위는?", "Testing only quantity 3 missed bugs with zero and negative orders. What checks should be added?"],
    [["경계값과 잘못된 입력에 대한 검증", "Checks for boundary values and invalid input"], ["단언 메시지", "The assertion message"], ["테스트 이름", "The test name"], ["실행 시간 측정", "A timing measurement"]]
  ),
  question(
    ["할인 계산 코드를 복사해 기대값을 만들었더니 같은 반올림 버그가 테스트에도 들어갔다. 문제는?", "Copying discount code to compute the expected value copied its rounding bug into the test. What went wrong?"],
    [["같은 오류를 함께 따라가 결함을 못 잡는다", "It repeats the same mistake and catches nothing"], ["검증이 두 배 강해진다", "The check becomes twice as strong"], ["실행이 빨라진다", "It runs faster"], ["커버리지가 올라간다", "Coverage rises"]]
  ),
];

/** LV.3 assertion-hound — Mock */
const assertionHoundQuiz: readonly QuizQuestion[] = [
  question(
    ["목(mock)을 쓰는 이유는?", "Why use a mock?"],
    [["외부 의존성을 제어 가능한 대역으로 바꾼다", "It replaces an external dependency with a controllable double"], ["테스트 코드를 짧게 만든다", "It shortens the test code"], ["커버리지를 자동으로 올린다", "It raises coverage automatically"], ["배포를 자동화한다", "It automates deployment"]]
  ),
  question(
    ["테스트에서 실제 네트워크 호출을 피해야 하는 이유는?", "Why avoid real network calls in a test?"],
    [["느리고 외부 상태에 따라 결과가 흔들린다", "They are slow and their result depends on outside state"], ["문법 오류가 나기 때문이다", "They cause syntax errors"], ["커버리지가 계산되지 않기 때문이다", "Coverage cannot be measured"], ["단언을 쓸 수 없기 때문이다", "Assertions become unavailable"]]
  ),
  question(
    ["미리 정한 값만 돌려주는 가장 단순한 테스트 대역은?", "What is the simplest test double that just returns canned values?"],
    [["스텁", "A stub"], ["스파이", "A spy"], ["페이크", "A fake"], ["더미", "A dummy"]]
  ),
  question(
    ["실제 동작을 유지하면서 호출 기록을 남기는 대역은?", "Which double keeps the real behavior but records the calls?"],
    [["스파이", "A spy"], ["스텁", "A stub"], ["더미", "A dummy"], ["목", "A mock"]]
  ),
  question(
    ["간단한 인메모리 구현으로 실제와 비슷하게 동작하는 대역은?", "Which double is a lightweight working implementation, such as in-memory storage?"],
    [["페이크", "A fake"], ["더미", "A dummy"], ["스파이", "A spy"], ["스텁", "A stub"]]
  ),
  question(
    ["모킹을 과도하게 쓰면 생기는 문제는?", "What problem comes from over-mocking?"],
    [["구현 세부에 묶여 리팩터링마다 테스트가 깨진다", "Tests bind to implementation details and break on every refactor"], ["테스트가 너무 느려진다", "Tests become too slow"], ["커버리지가 0이 된다", "Coverage drops to zero"], ["단언을 쓸 수 없다", "Assertions stop working"]]
  ),
  question(
    ["시간에 의존하는 코드를 안정적으로 테스트하는 방법은?", "How do you test time-dependent code reliably?"],
    [["시계를 주입하거나 가짜 타이머를 쓴다", "Inject a clock or use fake timers"], ["실제로 기다린다", "Actually wait for the time to pass"], ["테스트를 건너뛴다", "Skip the test"], ["재시도를 반복한다", "Retry until it passes"]]
  ),
  question(
    ["무작위 값을 쓰는 코드를 테스트할 때 알맞은 방법은?", "How should you test code that uses randomness?"],
    [["난수 생성기를 주입해 고정된 값을 쓰게 한다", "Inject the random generator so it yields fixed values"], ["여러 번 실행해 평균을 본다", "Run it many times and average the result"], ["난수를 제거한다", "Remove the randomness from production"], ["실패를 무시한다", "Ignore the failures"]]
  ),
  question(
    ["테스트마다 목 상태를 초기화해야 하는 이유는?", "Why reset mock state between tests?"],
    [["이전 테스트의 호출 기록이 다음 결과를 오염시킨다", "Calls recorded earlier contaminate the next result"], ["메모리를 아끼기 위해서다", "To save memory"], ["커버리지를 올리기 위해서다", "To raise coverage"], ["실행 순서를 바꾸기 위해서다", "To change the execution order"]]
  ),
  question(
    ["무엇을 목으로 대체할지 고를 때의 기준은?", "What guides the decision of what to mock?"],
    [["느리거나 통제할 수 없는 경계만 대체한다", "Replace only the slow or uncontrollable boundaries"], ["가능한 모든 것을 대체한다", "Replace absolutely everything"], ["아무것도 대체하지 않는다", "Replace nothing at all"], ["가장 짧은 함수부터 대체한다", "Start with the shortest functions"]]
  ),
];

/** LV.4 suite-guardian — Integration test */
const suiteGuardianQuiz: readonly QuizQuestion[] = [
  question(
    ["통합 테스트가 확인하는 것은?", "What does an integration test check?"],
    [["여러 구성 요소가 함께 동작하는지", "That several components work together"], ["함수 하나의 내부 계산", "The internal math of a single function"], ["화면의 색상", "Screen colors"], ["코드 스타일", "Code style"]]
  ),
  question(
    ["단위 테스트에 비해 통합 테스트의 특징은?", "How does an integration test compare with a unit test?"],
    [["느리지만 실제 연결 문제를 잡아낸다", "Slower, but it catches real wiring problems"], ["더 빠르고 더 정확하다", "Faster and more precise"], ["단언이 필요 없다", "It needs no assertions"], ["항상 목을 쓴다", "It always uses mocks"]]
  ),
  question(
    ["테스트 피라미드가 권하는 구성은?", "What does the test pyramid recommend?"],
    [["단위 테스트가 가장 많고 E2E가 가장 적다", "Many unit tests, fewer integration, fewest end-to-end"], ["E2E가 가장 많아야 한다", "End-to-end tests should be the most numerous"], ["모두 같은 수여야 한다", "All layers should have equal counts"], ["통합 테스트만 있으면 된다", "Integration tests alone are enough"]]
  ),
  question(
    ["실제 데이터베이스를 쓰는 테스트에서 지켜야 할 것은?", "What must a test that uses a real database do?"],
    [["매 테스트가 시작 상태를 스스로 준비하고 정리한다", "Each test sets up and cleans its own starting state"], ["이전 테스트의 데이터를 그대로 쓴다", "Reuse whatever the previous test left behind"], ["운영 데이터베이스에 붙는다", "Connect to the production database"], ["정리를 생략한다", "Skip cleanup"]]
  ),
  question(
    ["테스트에서 실제 외부 API를 그대로 호출하면 생기는 위험은?", "What is the risk of calling a real external API in a test?"],
    [["상대 서비스 상태에 따라 테스트가 흔들리고 요금이 든다", "The test wobbles with the other service's state and may cost money"], ["커버리지를 계산할 수 없다", "Coverage cannot be measured"], ["단언이 동작하지 않는다", "Assertions stop working"], ["문법 오류가 발생한다", "It causes syntax errors"]]
  ),
  question(
    ["실제 의존 서비스를 컨테이너로 띄워 테스트하는 방식의 장점은?", "What is the benefit of spinning up real dependencies in containers for tests?"],
    [["운영과 비슷한 환경에서 검증할 수 있다", "You verify against something close to production"], ["테스트가 항상 빨라진다", "Tests always get faster"], ["단언이 필요 없어진다", "Assertions become unnecessary"], ["목이 자동 생성된다", "Mocks are generated automatically"]]
  ),
  question(
    ["테스트 실행 순서에 의존하는 스위트의 문제는?", "What is wrong with a suite that depends on test order?"],
    [["병렬 실행이나 일부 실행에서 깨진다", "It breaks when tests run in parallel or in isolation"], ["느려지기만 한다", "It only gets slower"], ["커버리지가 중복된다", "Coverage is double counted"], ["문제가 없다", "Nothing is wrong with it"]]
  ),
  question(
    ["배포 직후 핵심 기능만 빠르게 확인하는 테스트는?", "Which test quickly confirms core functionality right after a deploy?"],
    [["스모크 테스트", "A smoke test"], ["부하 테스트", "A load test"], ["변이 테스트", "A mutation test"], ["정적 분석", "Static analysis"]]
  ),
  question(
    ["사용자 흐름 전체를 브라우저에서 확인하는 테스트는?", "Which test drives a whole user flow through a browser?"],
    [["E2E 테스트", "An end-to-end test"], ["단위 테스트", "A unit test"], ["계약 테스트", "A contract test"], ["린트 검사", "A lint check"]]
  ),
  question(
    ["서비스 사이의 인터페이스 약속만 검증하는 테스트는?", "Which test verifies only the agreed interface between services?"],
    [["계약 테스트", "A contract test"], ["부하 테스트", "A load test"], ["단위 테스트", "A unit test"], ["스모크 테스트", "A smoke test"]]
  ),
];

/** LV.5 regression-sentinel — Regression test */
const regressionSentinelQuiz: readonly QuizQuestion[] = [
  question(
    ["회귀 테스트의 목적은?", "What is the purpose of a regression test?"],
    [["변경 후에도 기존 동작이 깨지지 않았는지 확인한다", "It confirms existing behavior still works after a change"], ["새 기능을 설계한다", "It designs new features"], ["성능을 측정한다", "It measures performance"], ["코드 스타일을 정리한다", "It tidies code style"]]
  ),
  question(
    ["버그를 고친 뒤 회귀 테스트를 남기는 이유는?", "Why leave a regression test behind after fixing a bug?"],
    [["같은 결함이 다시 들어오면 즉시 잡힌다", "The same defect is caught immediately if it returns"], ["커버리지 숫자가 예뻐진다", "The coverage number looks nicer"], ["빌드가 빨라진다", "The build gets faster"], ["코드가 짧아진다", "The code gets shorter"]]
  ),
  question(
    ["CI에서 모든 PR마다 테스트를 돌리는 이유는?", "Why run the test suite on every pull request in CI?"],
    [["문제를 합치기 전에 발견해 되돌리기 쉽게 한다", "Problems surface before merge, where they are cheap to undo"], ["배포를 건너뛰기 위해서다", "To skip deployment"], ["리뷰를 생략하기 위해서다", "To skip code review"], ["테스트를 줄이기 위해서다", "To reduce the number of tests"]]
  ),
  question(
    ["회귀 스위트가 너무 느려졌을 때 합리적인 대응은?", "What is a sensible response when the regression suite grows too slow?"],
    [["병렬 실행과 계층 분리로 자주 도는 부분을 가볍게 한다", "Parallelize and split layers so the frequent runs stay light"], ["테스트를 전부 지운다", "Delete all the tests"], ["실패를 무시하도록 설정한다", "Configure failures to be ignored"], ["단언을 제거한다", "Strip out the assertions"]]
  ),
  question(
    ["출력 결과 전체를 저장해 두고 변화를 비교하는 테스트는?", "Which test stores a whole output and compares later changes against it?"],
    [["스냅숏 테스트", "A snapshot test"], ["부하 테스트", "A load test"], ["퍼즈 테스트", "A fuzz test"], ["계약 테스트", "A contract test"]]
  ),
  question(
    ["스냅숏을 확인 없이 갱신하면 생기는 문제는?", "What goes wrong when snapshots are updated without review?"],
    [["실제 버그까지 정답으로 굳어진다", "Real bugs get baked in as the expected result"], ["테스트가 실행되지 않는다", "The tests stop running"], ["커버리지가 0이 된다", "Coverage drops to zero"], ["문법 오류가 발생한다", "A syntax error appears"]]
  ),
  question(
    ["플레이키 테스트를 그대로 방치하면?", "What happens if flaky tests are left alone?"],
    [["실패를 무시하는 습관이 생겨 진짜 결함을 놓친다", "The team learns to ignore failures and misses real defects"], ["실행 시간이 짧아진다", "Runs get shorter"], ["커버리지가 올라간다", "Coverage rises"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["무작위 입력을 대량으로 넣어 예외를 찾아내는 기법은?", "Which technique floods code with random input to find crashes?"],
    [["퍼즈 테스트", "Fuzz testing"], ["스모크 테스트", "Smoke testing"], ["스냅숏 테스트", "Snapshot testing"], ["수용 테스트", "Acceptance testing"]]
  ),
  question(
    ["코드를 일부러 바꿔 테스트가 잡아내는지 확인하는 기법은?", "Which technique deliberately alters code to see whether tests notice?"],
    [["변이 테스트", "Mutation testing"], ["회귀 테스트", "Regression testing"], ["부하 테스트", "Load testing"], ["정적 분석", "Static analysis"]]
  ),
  question(
    ["오래되고 아무도 신뢰하지 않는 테스트에 대한 바른 대응은?", "What is the right response to old tests nobody trusts?"],
    [["의도를 살려 다시 쓰거나 근거를 남기고 제거한다", "Rewrite them to capture the intent, or remove them with a recorded reason"], ["실패해도 넘어가도록 꺼 둔다", "Disable them so failures pass"], ["그대로 방치한다", "Leave them exactly as they are"], ["모두 스냅숏으로 바꾼다", "Convert them all to snapshots"]]
  ),
];

const testingQuiz: readonly (readonly QuizQuestion[])[] = [
  checkScoutQuiz,
  caseInspectorQuiz,
  assertionHoundQuiz,
  suiteGuardianQuiz,
  regressionSentinelQuiz,
];

export default testingQuiz;
