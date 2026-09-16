import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 signal-owlet — Metric */
const signalOwletQuiz: readonly QuizQuestion[] = [
  question(
    ["메트릭이 측정하는 것은?", "What does a metric measure?"],
    [["시간에 따라 변하는 수치 상태", "Numeric state as it changes over time"], ["개별 사건의 자세한 내용", "The details of one individual event"], ["요청이 거친 전체 경로", "The full path one request took"], ["소스 코드의 구조", "The structure of the source code"]]
  ),
  question(
    ["계속 증가하기만 하는 메트릭 유형은?", "Which metric type only ever increases?"],
    [["카운터", "A counter"], ["게이지", "A gauge"], ["히스토그램", "A histogram"], ["서머리", "A summary"]]
  ),
  question(
    ["오르내릴 수 있는 현재 값을 나타내는 메트릭 유형은?", "Which metric type represents a value that can go up and down?"],
    [["게이지", "A gauge"], ["카운터", "A counter"], ["로그 라인", "A log line"], ["트레이스 스팬", "A trace span"]]
  ),
  question(
    ["응답 시간 분포를 구간별로 담는 메트릭 유형은?", "Which metric type records the distribution of response times in buckets?"],
    [["히스토그램", "A histogram"], ["카운터", "A counter"], ["게이지", "A gauge"], ["이벤트 로그", "An event log"]]
  ),
  question(
    ["응답 시간을 평균만 보면 놓치는 것은?", "What does looking only at average latency hide?"],
    [["일부 사용자가 겪는 느린 꼬리 구간", "The slow tail that a share of users actually experiences"], ["전체 요청 수", "The total request count"], ["오류율", "The error rate"], ["서버 대수", "The number of servers"]]
  ),
  question(
    ["p95 지연 시간이 뜻하는 것은?", "What does p95 latency mean?"],
    [["요청의 95%가 그 시간 안에 처리됐다", "95% of requests completed within that time"], ["평균이 95ms라는 뜻", "The average is 95 ms"], ["95개의 요청이 실패했다", "95 requests failed"], ["95번째 요청의 시간", "The time of the 95th request"]]
  ),
  question(
    ["메트릭에 붙이는 라벨(label)의 역할은?", "What is the role of a label on a metric?"],
    [["엔드포인트나 상태 코드처럼 차원을 나눠 볼 수 있게 한다", "It slices the metric by a dimension such as endpoint or status code"], ["값을 압축한다", "It compresses the value"], ["보존 기간을 정한다", "It sets the retention period"], ["알림을 보낸다", "It sends the alert"]]
  ),
  question(
    ["라벨에 사용자 ID 같은 값을 넣으면 생기는 문제는?", "What breaks when a label carries something like a user id?"],
    [["시계열이 폭증해 저장과 조회가 감당하지 못한다", "The number of time series explodes beyond what storage and queries can handle"], ["값이 음수가 된다", "The values turn negative"], ["알림이 중복된다", "Alerts get duplicated"], ["문제가 없다", "Nothing breaks"]]
  ),
  question(
    ["서비스 상태를 볼 때 우선 챙겨야 할 네 가지 신호는?", "Which four signals come first when watching a service?"],
    [["지연 시간, 트래픽, 오류, 포화도", "Latency, traffic, errors and saturation"], ["CPU, 디스크, 메모리, 네트워크만", "Only CPU, disk, memory and network"], ["코드 줄 수, 커밋 수, PR 수, 이슈 수", "Lines of code, commits, PRs and issues"], ["로그 수, 알림 수, 대시보드 수, 사용자 수", "Log count, alert count, dashboard count and user count"]]
  ),
  question(
    ["메트릭을 오래 보관할 때 흔히 쓰는 방법은?", "What is commonly done to keep metrics over a long period?"],
    [["오래된 데이터는 해상도를 낮춰 요약 보관한다", "Downsample older data and keep summaries"], ["모든 값을 원본 그대로 영구 보관한다", "Keep every raw value forever"], ["즉시 삭제한다", "Delete them immediately"], ["로그로 변환한다", "Convert them into logs"]]
  ),
];

/** LV.2 alert-scout — Log */
const alertScoutQuiz: readonly QuizQuestion[] = [
  question(
    ["로그가 남기는 것은?", "What does a log record?"],
    [["시스템에서 일어난 개별 사건", "An individual event that happened in the system"], ["시간에 따른 수치 추세", "A numeric trend over time"], ["요청의 전체 경로", "A request's full path"], ["코드의 복잡도", "The complexity of the code"]]
  ),
  question(
    ["구조화된 로그를 쓰는 이유는?", "Why write structured logs?"],
    [["필드로 검색하고 집계할 수 있다", "You can search and aggregate by field"], ["파일 크기가 줄어든다", "The files get smaller"], ["사람이 읽기만 편해진다", "It is only easier for humans to read"], ["보존 기간이 길어진다", "Retention gets longer"]]
  ),
  question(
    ["개발 중 상세 추적에 쓰는 가장 낮은 로그 수준은?", "Which is the lowest log level, used for detailed tracing during development?"],
    ["DEBUG", "INFO", "WARN", "ERROR"]
  ),
  question(
    ["즉시 조치가 필요한 실패에 써야 할 로그 수준은?", "Which log level fits a failure that needs attention?"],
    ["ERROR", "DEBUG", "TRACE", "INFO"]
  ),
  question(
    ["로그에 비밀번호나 토큰을 남기면?", "What if a log line contains a password or a token?"],
    [["로그 접근 권한이 있는 모두에게 노출되므로 마스킹해야 한다", "Everyone with log access can read it, so it must be masked"], ["로그는 안전하므로 문제없다", "Logs are safe, so it is fine"], ["자동으로 암호화된다", "It is encrypted automatically"], ["보존 기간이 지나면 안전해진다", "It becomes safe once retention expires"]]
  ),
  question(
    ["한 요청에 관련된 로그를 모아 보기 위해 넣는 값은?", "Which value lets you gather every log line belonging to one request?"],
    [["요청 상관관계 ID", "A request correlation id"], ["호스트 이름", "The host name"], ["로그 수준", "The log level"], ["타임스탬프만", "The timestamp alone"]]
  ),
  question(
    ["모든 요청을 DEBUG로 남기면 생기는 문제는?", "What goes wrong when every request is logged at DEBUG?"],
    [["비용과 잡음이 커져 정작 중요한 로그를 찾기 어렵다", "Cost and noise rise until the important lines are impossible to find"], ["검색이 빨라진다", "Search gets faster"], ["알림이 정확해진다", "Alerts get more accurate"], ["아무 문제가 없다", "Nothing goes wrong"]]
  ),
  question(
    ["여러 서버의 로그를 한곳에 모으는 이유는?", "Why ship logs from many servers into one place?"],
    [["서버를 옮겨 다니지 않고 전체를 함께 조회할 수 있다", "You can query everything together instead of hopping between servers"], ["디스크를 아끼기 위해서다", "To save disk space"], ["로그 수준을 바꾸기 위해서다", "To change log levels"], ["보안 검사를 대신하기 위해서다", "To replace security scanning"]]
  ),
  question(
    ["예외를 로그로 남길 때 함께 담아야 할 것은?", "What belongs in a log line that records an exception?"],
    [["스택 트레이스와 무엇을 하려던 중이었는지의 맥락", "The stack trace and context about what was being attempted"], ["예외 이름만", "Only the exception name"], ["타임스탬프만", "Only the timestamp"], ["사용자의 비밀번호", "The user's password"]]
  ),
  question(
    ["로그 보존 기간을 정할 때 고려할 것은?", "What should drive a log retention period?"],
    [["조사에 필요한 기간, 규정 요건, 비용", "Investigation needs, compliance requirements and cost"], ["디스크 이름", "The disk name"], ["로그 수준의 개수", "The number of log levels"], ["서버 대수만", "The server count alone"]]
  ),
];

/** LV.3 metric-watcher — Trace */
const metricWatcherQuiz: readonly QuizQuestion[] = [
  question(
    ["트레이스가 보여 주는 것은?", "What does a trace show?"],
    [["하나의 요청이 여러 서비스를 거친 경로와 소요 시간", "The path and timing of one request across several services"], ["시간에 따른 수치 추세", "A numeric trend over time"], ["서버의 디스크 사용량", "A server's disk usage"], ["코드의 테스트 커버리지", "The code's test coverage"]]
  ),
  question(
    ["트레이스를 구성하는 개별 작업 단위는?", "What is one unit of work inside a trace called?"],
    [["스팬", "A span"], ["메트릭", "A metric"], ["라벨", "A label"], ["버킷", "A bucket"]]
  ),
  question(
    ["여러 서비스를 하나의 트레이스로 묶어 주는 것은?", "What ties several services into one trace?"],
    [["서비스 호출 시 함께 전달되는 트레이스 컨텍스트", "The trace context propagated along service calls"], ["각 서비스의 로그 수준", "Each service's log level"], ["서버의 IP 주소", "The server IP address"], ["요청의 본문 크기", "The request body size"]]
  ),
  question(
    ["마이크로서비스에서 트레이싱이 특히 유용한 이유는?", "Why is tracing especially useful in microservices?"],
    [["어느 서비스에서 시간이 걸렸는지 바로 짚어 준다", "It pinpoints which service the time was spent in"], ["서비스 수를 줄여 준다", "It reduces the number of services"], ["로그를 대신한다", "It replaces logging"], ["배포를 자동화한다", "It automates deployment"]]
  ),
  question(
    ["모든 요청을 추적하지 않고 일부만 수집하는 방식은?", "What is collecting only a portion of requests called?"],
    [["샘플링", "Sampling"], ["집계", "Aggregation"], ["필터링", "Filtering"], ["압축", "Compression"]]
  ),
  question(
    ["요청 결과를 보고 수집 여부를 정하는 샘플링 방식은?", "Which sampling decides after seeing how a request turned out?"],
    [["테일 기반 샘플링", "Tail-based sampling"], ["헤드 기반 샘플링", "Head-based sampling"], ["무작위 샘플링", "Random sampling"], ["고정 비율 샘플링", "Fixed-rate sampling"]]
  ),
  question(
    ["느린 요청만 골라 트레이스를 보관하려는 이유는?", "Why keep traces mainly for slow requests?"],
    [["비용을 아끼면서 조사에 필요한 사례를 확보한다", "It saves cost while keeping the cases worth investigating"], ["빠른 요청은 존재하지 않아서다", "Because fast requests do not exist"], ["트레이스가 메트릭을 대신해서다", "Because traces replace metrics"], ["샘플링이 불가능해서다", "Because sampling is impossible"]]
  ),
  question(
    ["메트릭·로그·트레이스를 함께 쓰는 이유는?", "Why use metrics, logs and traces together?"],
    [["무엇이·왜·어디서 문제인지를 각각 다른 각도로 알려 준다", "Each answers a different question: what, why and where"], ["셋 중 하나만 있으면 충분해서다", "Because any one of them is enough"], ["비용을 늘리기 위해서다", "To increase cost"], ["대시보드 수를 늘리기 위해서다", "To add more dashboards"]]
  ),
  question(
    ["여러 관측 도구 사이의 계측 표준을 제공하는 프로젝트는?", "Which project provides a vendor-neutral instrumentation standard?"],
    ["OpenTelemetry", "OpenSSL", "OpenAPI", "OpenSearch"]
  ),
  question(
    ["트레이스에서 병목 구간을 찾는 기본 방법은?", "How do you find a bottleneck in a trace?"],
    [["가장 오래 걸린 스팬과 그 자식 스팬을 따라간다", "Follow the longest span and drill into its children"], ["스팬 개수를 센다", "Count the number of spans"], ["가장 짧은 스팬을 본다", "Look at the shortest span"], ["로그 수준을 바꾼다", "Change the log level"]]
  ),
];

/** LV.4 telemetry-seer — Alert */
const telemetrySeerQuiz: readonly QuizQuestion[] = [
  question(
    ["알림(alert)이 하는 일은?", "What does an alert do?"],
    [["관찰 값이 정한 조건을 넘으면 담당자에게 알린다", "It notifies a responder when an observed value crosses a condition"], ["지표를 저장한다", "It stores the metric"], ["로그를 수집한다", "It collects logs"], ["트레이스를 샘플링한다", "It samples traces"]]
  ),
  question(
    ["좋은 알림의 조건은?", "What makes a good alert?"],
    [["사람이 지금 조치할 수 있는 내용이어야 한다", "It must be something a person can act on right now"], ["가능한 많이 울려야 한다", "It should fire as often as possible"], ["원인을 설명하지 않아야 한다", "It should not explain the cause"], ["자동으로 무시되어야 한다", "It should be ignored automatically"]]
  ),
  question(
    ["알림이 너무 많아 무뎌지는 현상을 부르는 말은?", "What is it called when too many alerts make responders numb?"],
    [["알림 피로", "Alert fatigue"], ["카디널리티 폭증", "Cardinality explosion"], ["샘플링 편향", "Sampling bias"], ["로그 회전", "Log rotation"]]
  ),
  question(
    ["CPU 사용률 자체보다 알림 기준으로 더 나은 것은?", "What is a better alert condition than CPU utilization itself?"],
    [["사용자가 체감하는 오류율이나 지연 시간", "Error rate or latency that users actually feel"], ["디스크 이름", "The disk name"], ["프로세스 개수", "The process count"], ["로그 줄 수", "The number of log lines"]]
  ),
  question(
    ["일시적인 튐으로 알림이 울리는 것을 막는 설정은?", "Which setting stops a momentary spike from paging someone?"],
    [["조건이 일정 시간 지속될 때만 울리게 한다", "Require the condition to persist for a period before firing"], ["임계값을 없앤다", "Remove the threshold"], ["알림을 중복 발송한다", "Send the alert twice"], ["로그 수준을 낮춘다", "Lower the log level"]]
  ),
  question(
    ["하나의 원인에서 수십 개 알림이 쏟아질 때 필요한 것은?", "What helps when one cause produces dozens of alerts?"],
    [["알림 그룹화와 억제 규칙", "Grouping and inhibition rules"], ["임계값 제거", "Removing the thresholds"], ["더 많은 알림 채널", "More notification channels"], ["보존 기간 연장", "Longer retention"]]
  ),
  question(
    ["알림에 함께 담으면 좋은 것은?", "What is worth attaching to an alert?"],
    [["영향 범위와 대응 절차로 가는 링크", "The scope of impact and a link to the runbook"], ["개발자 이름만", "Only a developer's name"], ["코드 전체", "The entire source code"], ["아무것도 없어야 한다", "Nothing at all"]]
  ),
  question(
    ["계획된 작업 중에 알림을 잠시 멈추는 기능은?", "Which feature pauses alerts during planned work?"],
    [["무음 기간(silence)", "A silence window"], ["롤백", "A rollback"], ["샘플링", "Sampling"], ["페일오버", "Failover"]]
  ),
  question(
    ["한밤중에 사람을 깨울 알림의 기준은?", "What justifies waking someone at night?"],
    [["지금 대응하지 않으면 사용자 피해가 커지는 경우", "User impact will grow unless someone responds now"], ["경고 수준 로그가 늘어난 경우", "Warning-level logs increased"], ["디스크가 절반 찬 경우", "The disk is half full"], ["배포가 끝난 경우", "A deployment finished"]]
  ),
  question(
    ["울린 적 없는 알림을 그대로 두면 안 되는 이유는?", "Why review alerts that have never fired?"],
    [["조건이 잘못됐거나 이미 무의미해졌을 수 있다", "The condition may be wrong or no longer meaningful"], ["비용이 두 배가 되기 때문이다", "They double the cost"], ["대시보드를 가리기 때문이다", "They cover the dashboard"], ["로그를 지우기 때문이다", "They erase logs"]]
  ),
];

/** LV.5 observability-oracle — SLI/SLO */
const observabilityOracleQuiz: readonly QuizQuestion[] = [
  question(
    ["SLI가 뜻하는 것은?", "What is an SLI?"],
    [["서비스 신뢰성을 측정하는 지표", "A measured indicator of service reliability"], ["신뢰성의 목표 수준", "The target level for reliability"], ["고객과의 법적 계약", "A legal contract with the customer"], ["장애 대응 절차", "An incident response procedure"]]
  ),
  question(
    ["SLO가 뜻하는 것은?", "What is an SLO?"],
    [["지표가 달성해야 할 목표 수준", "The target level the indicator should meet"], ["측정 지표 자체", "The measured indicator itself"], ["위반 시의 배상 조건", "The penalty for a breach"], ["알림 임계값의 다른 이름", "Another name for an alert threshold"]]
  ),
  question(
    ["SLA가 SLO와 다른 점은?", "How does an SLA differ from an SLO?"],
    [["고객과의 약속이라 위반 시 책임이 따른다", "It is a customer commitment with consequences if breached"], ["내부 목표라 책임이 없다", "It is an internal target with no consequences"], ["지표를 측정하지 않는다", "It measures nothing"], ["둘은 같은 말이다", "They mean the same thing"]]
  ),
  question(
    ["오류 예산(error budget)이 뜻하는 것은?", "What is an error budget?"],
    [["SLO를 지키면서 허용되는 실패의 총량", "The total failure allowed while still meeting the SLO"], ["장애 대응에 쓰는 비용", "Money spent on incident response"], ["허용된 배포 횟수", "The number of deploys allowed"], ["알림의 최대 개수", "The maximum number of alerts"]]
  ),
  question(
    ["오류 예산을 다 써 버렸을 때 합리적인 결정은?", "What is a sensible decision when the error budget is exhausted?"],
    [["새 기능보다 안정성 작업을 우선한다", "Prioritize reliability work over new features"], ["더 빠르게 배포한다", "Deploy even faster"], ["SLO를 몰래 낮춘다", "Quietly lower the SLO"], ["모니터링을 끈다", "Turn monitoring off"]]
  ),
  question(
    ["가용성 목표를 100%로 잡으면 안 되는 이유는?", "Why should an availability target never be 100%?"],
    [["비용이 급격히 오르고 변경을 사실상 멈춰야 한다", "Cost rises steeply and change effectively has to stop"], ["측정할 수 없기 때문이다", "It cannot be measured"], ["고객이 원하지 않기 때문이다", "Customers do not want it"], ["SLI가 정의되지 않기 때문이다", "SLIs cannot be defined for it"]]
  ),
  question(
    ["SLI를 고를 때 가장 중요한 기준은?", "What matters most when choosing an SLI?"],
    [["사용자가 실제로 체감하는 경험을 반영해야 한다", "It must reflect what users actually experience"], ["측정이 가장 쉬워야 한다", "It must be the easiest thing to measure"], ["숫자가 항상 높아야 한다", "Its number must always look high"], ["서버 내부 지표여야 한다", "It must be an internal server metric"]]
  ),
  question(
    ["오류 예산 소진 속도에 따라 알림을 거는 방식은?", "Which alerting approach fires based on how fast the error budget burns?"],
    [["번 레이트 알림", "Burn-rate alerting"], ["임계값 고정 알림", "A fixed-threshold alert"], ["로그 기반 알림", "A log-based alert"], ["배포 알림", "A deployment notification"]]
  ),
  question(
    ["관측 가능성(observability)이 모니터링과 다른 점은?", "How does observability differ from monitoring?"],
    [["미리 정한 지표 밖의 새로운 질문에도 답할 수 있다", "It answers new questions beyond the metrics you planned for"], ["알림을 더 많이 보낸다", "It sends more alerts"], ["대시보드 수가 많다", "It has more dashboards"], ["로그만 사용한다", "It uses only logs"]]
  ),
  question(
    ["신뢰성 목표를 정기적으로 재검토해야 하는 이유는?", "Why revisit reliability targets regularly?"],
    [["사용자 기대와 서비스 특성이 시간이 지나며 달라진다", "User expectations and the service itself change over time"], ["숫자를 낮추기 위해서다", "So the numbers can be lowered"], ["보고서를 늘리기 위해서다", "To produce more reports"], ["알림을 줄이기 위해서다", "To reduce the alert count"]]
  ),
];

const monitoringQuiz: readonly (readonly QuizQuestion[])[] = [
  signalOwletQuiz,
  alertScoutQuiz,
  metricWatcherQuiz,
  telemetrySeerQuiz,
  observabilityOracleQuiz,
];

export default monitoringQuiz;
