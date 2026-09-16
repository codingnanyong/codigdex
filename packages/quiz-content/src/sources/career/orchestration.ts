import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 task-spinner — DAG */
const taskSpinnerQuiz: readonly QuizQuestion[] = [
  question(
    ["DAG가 표현하는 것은?", "What does a DAG represent?"],
    [["순환 없이 이어진 작업 의존 관계", "Task dependencies connected without any cycle"], ["작업의 실행 시간", "How long tasks take"], ["작업의 로그", "The task logs"], ["작업의 담당자", "Who owns each task"]]
  ),
  question(
    ["DAG에서 A가 뜻하는 것은?", "What does the A in DAG stand for?"],
    [["비순환", "Acyclic"], ["자동", "Automatic"], ["집계", "Aggregate"], ["비동기", "Asynchronous"]]
  ),
  question(
    ["워크플로에 순환이 생기면?", "What happens if a cycle appears in a workflow?"],
    [["어떤 작업도 시작 조건을 만족하지 못해 실행할 수 없다", "No task can ever satisfy its start condition, so nothing runs"], ["가장 빠른 작업부터 실행된다", "The fastest task runs first"], ["자동으로 끊어진다", "It is broken automatically"], ["문제가 없다", "Nothing is wrong"]]
  ),
  question(
    ["DAG를 코드로 정의했을 때의 이점은?", "What is the benefit of defining a DAG in code?"],
    [["변경 이력을 남기고 리뷰와 테스트를 할 수 있다", "Changes are versioned, reviewable and testable"], ["실행이 항상 빨라진다", "Execution always gets faster"], ["실패가 사라진다", "Failures stop happening"], ["로그가 필요 없어진다", "Logging becomes unnecessary"]]
  ),
  question(
    ["서로 의존이 없는 작업들이 DAG에서 갖는 특징은?", "What is true of tasks with no dependency between them?"],
    [["동시에 실행할 수 있다", "They can run at the same time"], ["항상 순서대로 실행된다", "They always run in sequence"], ["실행되지 않는다", "They never run"], ["하나로 합쳐진다", "They are merged into one"]]
  ),
  question(
    ["워크플로가 커질 때 DAG를 나누는 기준으로 좋은 것은?", "What is a good basis for splitting a growing workflow?"],
    [["일정 주기와 책임 주체가 같은 단위로 묶는다", "Group by shared schedule and shared ownership"], ["작업 이름의 길이", "The length of the task names"], ["알파벳 순서", "Alphabetical order"], ["작업 개수를 똑같이", "Equal task counts"]]
  ),
  question(
    ["한 DAG 실행 인스턴스를 부르는 말은?", "What is a single execution instance of a DAG called?"],
    [["런 또는 실행 인스턴스", "A run, or execution instance"], ["태스크", "A task"], ["스케줄", "A schedule"], ["센서", "A sensor"]]
  ),
  question(
    ["DAG 시각화가 운영에 도움이 되는 이유는?", "Why does a DAG visualization help in operations?"],
    [["어디서 멈췄고 무엇이 막혀 있는지 한눈에 보인다", "It shows at a glance where things stopped and what is blocked"], ["실행을 빠르게 한다", "It speeds up execution"], ["코드를 생성한다", "It generates the code"], ["비용을 줄인다", "It reduces cost"]]
  ),
  question(
    ["작업 사이에 큰 데이터를 직접 넘기면 안 되는 이유는?", "Why avoid passing large data directly between tasks?"],
    [["메타데이터 저장소에 부담을 주므로 위치만 전달해야 한다", "It strains the metadata store; pass a location reference instead"], ["작업이 실행되지 않는다", "The tasks will not run"], ["DAG가 순환한다", "The DAG becomes cyclic"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["DAG 정의 파일 안에서 무거운 연산을 하면?", "What if a DAG definition file performs heavy computation?"],
    [["파싱할 때마다 실행돼 스케줄러가 느려진다", "It runs on every parse and slows the scheduler down"], ["한 번만 실행된다", "It runs only once"], ["실행되지 않는다", "It never runs"], ["성능이 좋아진다", "Performance improves"]]
  ),
];

/** LV.2 dependency-linker — Task */
const dependencyLinkerQuiz: readonly QuizQuestion[] = [
  question(
    ["워크플로에서 태스크가 뜻하는 것은?", "What is a task in a workflow?"],
    [["실행하고 추적하는 최소 작업 단위", "The smallest unit of work that is executed and tracked"], ["전체 워크플로", "The entire workflow"], ["실행 일정", "The schedule"], ["로그 파일", "A log file"]]
  ),
  question(
    ["태스크를 작게 나누면 좋은 이유는?", "Why keep tasks small?"],
    [["실패 지점을 좁히고 실패한 부분만 다시 실행할 수 있다", "Failures are localized, and only the failed part needs rerunning"], ["실행 속도가 항상 빨라진다", "Execution always gets faster"], ["로그가 줄어든다", "There are fewer logs"], ["의존성이 사라진다", "Dependencies disappear"]]
  ),
  question(
    ["태스크가 멱등해야 하는 이유는?", "Why should a task be idempotent?"],
    [["재시도나 백필로 다시 실행돼도 결과가 망가지지 않는다", "Retries and backfills can rerun it without corrupting the result"], ["실행이 빨라지기 때문이다", "It runs faster"], ["로그가 줄어들기 때문이다", "It logs less"], ["의존성이 필요 없어지기 때문이다", "Dependencies become unnecessary"]]
  ),
  question(
    ["과거 구간을 거슬러 다시 실행하는 것을 부르는 말은?", "What is rerunning a workflow over past intervals called?"],
    [["백필", "A backfill"], ["롤백", "A rollback"], ["페일오버", "A failover"], ["스케일 아웃", "Scaling out"]]
  ),
  question(
    ["태스크가 처리할 구간을 알아야 하는 이유는?", "Why must a task know which interval it processes?"],
    [["실행 시각이 아니라 대상 구간을 기준으로 재현 가능해진다", "It stays reproducible by target interval rather than by wall-clock run time"], ["로그를 줄이기 위해서다", "To reduce logging"], ["의존성을 없애기 위해서다", "To remove dependencies"], ["비용을 줄이기 위해서다", "To reduce cost"]]
  ),
  question(
    ["외부 조건이 충족될 때까지 기다리는 태스크 유형은?", "Which task type waits until an external condition is met?"],
    [["센서", "A sensor"], ["오퍼레이터 없는 태스크", "A no-op task"], ["트리거 태스크", "A trigger task"], ["정리 태스크", "A cleanup task"]]
  ),
  question(
    ["센서를 오래 켜 두면 생기는 문제는?", "What is the cost of a long-running sensor?"],
    [["실행 슬롯을 점유해 다른 작업을 막을 수 있다", "It occupies a worker slot and can block other work"], ["로그가 사라진다", "Logs disappear"], ["의존성이 깨진다", "Dependencies break"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["동시에 실행할 수 있는 태스크 수를 제한하는 이유는?", "Why limit how many tasks run at once?"],
    [["원천 시스템과 실행 자원을 보호한다", "It protects source systems and execution resources"], ["실행 순서를 알파벳으로 만든다", "It sorts execution alphabetically"], ["의존성을 만든다", "It creates dependencies"], ["로그를 늘린다", "It produces more logs"]]
  ),
  question(
    ["태스크 로그를 중앙에 모아야 하는 이유는?", "Why collect task logs centrally?"],
    [["실행 노드가 사라져도 실패 원인을 조사할 수 있다", "Failures stay investigable even after the worker is gone"], ["실행이 빨라진다", "Execution gets faster"], ["의존성이 단순해진다", "Dependencies get simpler"], ["재시도가 필요 없어진다", "Retries become unnecessary"]]
  ),
  question(
    ["태스크가 아주 오래 걸릴 때 필요한 설정은?", "What setting does a task that can run very long need?"],
    [["최대 실행 시간 제한과 알림", "A maximum runtime limit with an alert"], ["더 많은 의존성", "More dependencies"], ["더 잦은 스케줄", "A more frequent schedule"], ["더 긴 보존 기간", "Longer retention"]]
  ),
];

/** LV.3 retry-weaver — Dependency */
const retryWeaverQuiz: readonly QuizQuestion[] = [
  question(
    ["작업 간 의존성이 뜻하는 것은?", "What does a dependency between tasks mean?"],
    [["한 작업이 다른 작업보다 먼저 끝나야 한다", "One task must finish before another can run"], ["두 작업이 같은 코드를 쓴다", "Two tasks share the same code"], ["두 작업이 같은 담당자를 가진다", "Two tasks share one owner"], ["두 작업이 같은 로그를 남긴다", "Two tasks write the same log"]]
  ),
  question(
    ["앞 작업이 실패하면 뒤 작업은 기본적으로?", "By default, what happens to a downstream task when its upstream fails?"],
    [["실행되지 않고 대기 또는 건너뛴 상태가 된다", "It does not run and is left waiting or skipped"], ["그대로 실행된다", "It runs anyway"], ["앞 작업을 대신 실행한다", "It runs the upstream task instead"], ["DAG가 삭제된다", "The DAG is deleted"]]
  ),
  question(
    ["앞 작업이 실패해도 정리 작업은 실행되게 하려면?", "How do you make a cleanup task run even when an upstream fails?"],
    [["실행 조건을 앞 작업 성공이 아닌 완료로 설정한다", "Set its trigger rule to run on completion rather than success"], ["의존성을 제거한다", "Remove the dependency"], ["재시도를 늘린다", "Increase the retries"], ["스케줄을 바꾼다", "Change the schedule"]]
  ),
  question(
    ["다른 워크플로의 완료를 기다려야 할 때 쓰는 것은?", "What waits for another workflow to complete?"],
    [["외부 태스크 센서", "An external task sensor"], ["재시도 정책", "A retry policy"], ["동시성 제한", "A concurrency limit"], ["로그 수집기", "A log collector"]]
  ),
  question(
    ["의존성이 지나치게 촘촘하면 생기는 문제는?", "What goes wrong when dependencies are too tightly woven?"],
    [["한 작업의 지연이 전체를 멈춰 세운다", "One task's delay stalls the entire workflow"], ["병렬성이 늘어난다", "Parallelism increases"], ["실패가 줄어든다", "Failures decrease"], ["로그가 줄어든다", "Logging decreases"]]
  ),
  question(
    ["작업이 실행 자원을 기다리며 쌓이는 현상을 부르는 말은?", "What is it called when work piles up waiting for execution capacity?"],
    [["큐 적체", "Queue backlog"], ["순환 의존", "A circular dependency"], ["백필", "A backfill"], ["멱등성", "Idempotence"]]
  ),
  question(
    ["여러 워크플로가 같은 자원을 두고 경쟁할 때 쓰는 장치는?", "Which mechanism arbitrates workflows competing for the same resource?"],
    [["자원 풀과 우선순위", "Resource pools with priorities"], ["재시도 지연", "Retry delay"], ["로그 회전", "Log rotation"], ["센서 타임아웃", "Sensor timeouts"]]
  ),
  question(
    ["의존 관계를 명시하지 않고 실행 시각만 맞춰 두면?", "What if two jobs rely on timing instead of a declared dependency?"],
    [["앞 작업이 늦어지면 조용히 잘못된 데이터를 읽는다", "When the first runs late, the second silently reads wrong data"], ["자동으로 기다린다", "It waits automatically"], ["오류가 발생한다", "It raises an error"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["임계 경로(critical path)가 뜻하는 것은?", "What is a workflow's critical path?"],
    [["전체 완료 시간을 결정하는 가장 긴 의존 경로", "The longest dependency chain, which sets total completion time"], ["가장 자주 실패하는 작업", "The task that fails most often"], ["가장 많은 로그를 남기는 작업", "The task that logs the most"], ["가장 먼저 등록된 작업", "The task registered first"]]
  ),
  question(
    ["워크플로 완료가 계속 늦어질 때 먼저 볼 것은?", "What should you inspect first when a workflow keeps finishing late?"],
    [["임계 경로 위의 가장 오래 걸리는 작업", "The slowest task on the critical path"], ["가장 짧은 작업", "The shortest task"], ["로그 파일 이름", "The log file names"], ["담당자 수", "The number of owners"]]
  ),
];

/** LV.4 schedule-conductor — Schedule */
const scheduleConductorQuiz: readonly QuizQuestion[] = [
  question(
    ["스케줄이 정하는 것은?", "What does a schedule define?"],
    [["워크플로가 언제 또는 얼마나 자주 실행될지", "When, or how often, a workflow runs"], ["작업 사이의 의존 관계", "The dependencies between tasks"], ["실패 시 재시도 횟수", "How many times to retry on failure"], ["로그 보존 기간", "How long logs are kept"]]
  ),
  question(
    ["주기적 실행을 표현하는 표준 표기는?", "Which standard notation expresses a recurring schedule?"],
    [["크론 표현식", "A cron expression"], ["정규 표현식", "A regular expression"], ["JSON 스키마", "A JSON schema"], ["시맨틱 버전", "A semantic version"]]
  ),
  question(
    ["0 3 * * * 크론 표현식이 뜻하는 것은?", "What does the cron expression 0 3 * * * mean?"],
    [["매일 새벽 3시 정각", "Every day at 3:00"], ["3분마다", "Every three minutes"], ["매달 3일", "On the third of every month"], ["3시간마다", "Every three hours"]]
  ),
  question(
    ["여러 워크플로를 정각에 몰아 두면 생기는 문제는?", "What goes wrong when many workflows all start on the hour?"],
    [["동시 실행이 몰려 자원이 부족해진다", "Concurrent runs spike and starve each other of resources"], ["실행이 빨라진다", "Everything runs faster"], ["의존성이 사라진다", "Dependencies disappear"], ["로그가 줄어든다", "Logging decreases"]]
  ),
  question(
    ["스케줄 시각을 다룰 때 표준으로 삼아야 할 시간대는?", "Which time zone should schedules be anchored to?"],
    [["UTC를 기준으로 두고 표시할 때 변환한다", "Anchor on UTC and convert only for display"], ["실행 서버의 로컬 시간", "The worker's local time"], ["사용자의 브라우저 시간", "The user's browser time"], ["시간대는 상관없다", "The time zone does not matter"]]
  ),
  question(
    ["서머타임이 있는 지역 시간대로 스케줄을 두면?", "What happens with a schedule anchored to a zone that observes daylight saving?"],
    [["전환일에 실행이 건너뛰거나 두 번 일어날 수 있다", "A run can be skipped or duplicated on the changeover day"], ["항상 정확히 실행된다", "It always runs exactly once"], ["실행되지 않는다", "It never runs"], ["시간대가 자동 변경된다", "The zone changes automatically"]]
  ),
  question(
    ["이전 실행이 끝나지 않았는데 다음 스케줄이 오면?", "What if the next schedule arrives while the previous run is unfinished?"],
    [["중첩 실행을 허용할지 정책으로 정해야 한다", "A policy must decide whether overlapping runs are allowed"], ["항상 자동으로 대기한다", "It always waits automatically"], ["이전 실행이 취소된다", "The previous run is cancelled"], ["스케줄이 삭제된다", "The schedule is deleted"]]
  ),
  question(
    ["데이터가 준비된 뒤에 실행해야 할 때 적절한 방식은?", "What fits a workflow that must wait until its data is ready?"],
    [["시각이 아니라 데이터 도착 이벤트로 트리거한다", "Trigger on a data-arrival event rather than a clock time"], ["여유 있게 더 늦은 시각으로 미룬다", "Just push the clock time later"], ["재시도 횟수를 늘린다", "Increase the retry count"], ["스케줄을 더 자주 돌린다", "Run the schedule more often"]]
  ),
  question(
    ["스케줄 간격보다 실행 시간이 더 길어지면?", "What if a run takes longer than the schedule interval?"],
    [["큐가 쌓이므로 간격을 늘리거나 작업을 나눠야 한다", "The queue grows, so widen the interval or split the work"], ["자동으로 최적화된다", "It optimizes itself"], ["다음 실행이 취소된다", "The next run is cancelled"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["스케줄 변경 전에 확인해야 할 것은?", "What should you check before changing a schedule?"],
    [["그 결과에 의존하는 하류 작업과 소비자", "The downstream tasks and consumers that depend on its output"], ["로그 파일 이름", "The log file names"], ["작업 이름 길이", "The task name lengths"], ["DAG 색상", "The DAG colors"]]
  ),
];

/** LV.5 workflow-maestro — Retry */
const workflowMaestroQuiz: readonly QuizQuestion[] = [
  question(
    ["재시도 정책이 다루는 것은?", "What does a retry policy address?"],
    [["일시적 실패를 정해진 규칙에 따라 다시 실행하는 일", "Rerunning temporarily failed work according to a defined rule"], ["작업의 실행 순서", "The order in which tasks run"], ["로그 보존 기간", "Log retention"], ["작업 담당자 지정", "Assigning task owners"]]
  ),
  question(
    ["재시도로 해결되지 않는 실패 유형은?", "Which failure type retries cannot fix?"],
    [["코드 버그나 잘못된 입력 같은 영구적 실패", "Permanent failures such as a code bug or invalid input"], ["일시적 네트워크 오류", "A transient network error"], ["짧은 서비스 중단", "A brief service outage"], ["요청 제한 초과", "A rate limit hit"]]
  ),
  question(
    ["재시도 간격을 점점 늘리는 방식은?", "What is progressively lengthening the wait between retries called?"],
    [["지수 백오프", "Exponential backoff"], ["라운드 로빈", "Round robin"], ["선형 스케줄", "Linear scheduling"], ["고정 윈도우", "A fixed window"]]
  ),
  question(
    ["지수 백오프에 무작위 지연을 더하는 이유는?", "Why add randomness to exponential backoff?"],
    [["여러 클라이언트가 동시에 재시도해 몰리는 것을 막는다", "It stops many clients from retrying in unison"], ["재시도를 빠르게 하기 위해서다", "To make retries faster"], ["로그를 줄이기 위해서다", "To reduce logging"], ["멱등성을 만들기 위해서다", "To create idempotence"]]
  ),
  question(
    ["재시도 횟수를 무제한으로 두면?", "What if the retry count is unbounded?"],
    [["실패한 작업이 자원을 계속 소모하고 문제를 가린다", "A failing task burns resources indefinitely and hides the problem"], ["언젠가 반드시 성공한다", "It is guaranteed to succeed eventually"], ["자원을 아낀다", "It saves resources"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["재시도가 안전하려면 작업이 갖춰야 할 성질은?", "What property must a task have for retries to be safe?"],
    [["멱등성", "Idempotence"], ["병렬성", "Parallelism"], ["가변성", "Mutability"], ["휘발성", "Volatility"]]
  ),
  question(
    ["반복 실패하는 대상 호출을 잠시 차단하는 패턴은?", "Which pattern temporarily blocks calls to a repeatedly failing dependency?"],
    [["서킷 브레이커", "A circuit breaker"], ["로드 밸런서", "A load balancer"], ["레이트 리미터", "A rate limiter"], ["캐시", "A cache"]]
  ),
  question(
    ["끝내 처리하지 못한 메시지를 따로 모아 두는 곳은?", "Where do messages that could never be processed end up?"],
    [["데드 레터 큐", "A dead-letter queue"], ["백필 큐", "A backfill queue"], ["센서 큐", "A sensor queue"], ["임시 테이블", "A temporary table"]]
  ),
  question(
    ["재시도가 모두 소진됐을 때 필요한 것은?", "What is needed once every retry is exhausted?"],
    [["담당자에게 알리고 실패 맥락을 남긴다", "Alert an owner and preserve the failure context"], ["조용히 건너뛴다", "Skip it silently"], ["재시도를 다시 시작한다", "Start the retries over"], ["로그를 삭제한다", "Delete the logs"]]
  ),
  question(
    ["여러 번의 재시도가 성공했지만 매번 발생한다면?", "What if retries keep succeeding but the failure recurs every run?"],
    [["근본 원인을 조사해야 할 신호로 본다", "Treat it as a signal to investigate the root cause"], ["정상이므로 무시한다", "Ignore it as normal"], ["재시도 횟수를 더 늘린다", "Raise the retry count further"], ["알림을 끈다", "Turn off the alerts"]]
  ),
];

const orchestrationQuiz: readonly (readonly QuizQuestion[])[] = [
  taskSpinnerQuiz,
  dependencyLinkerQuiz,
  retryWeaverQuiz,
  scheduleConductorQuiz,
  workflowMaestroQuiz,
];

export default orchestrationQuiz;
