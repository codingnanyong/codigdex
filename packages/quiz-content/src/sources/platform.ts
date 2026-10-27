import { text } from "@codigdex/game-core/i18n/locale";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

// Original field scenarios. Concepts checked against Google SRE Workbook:
// https://sre.google/workbook/canarying-releases/
// https://sre.google/workbook/error-budget-policy/
// https://sre.google/workbook/alerting-on-slos/
// https://sre.google/workbook/incident-response/
// https://sre.google/workbook/postmortem-culture/
type Copy = readonly [ko: string, en: string];
type Scenario = readonly [ko: string, en: string, answer: number];
function mission(actions: readonly Copy[], scenarios: readonly Scenario[]): readonly QuizQuestion[] {
  return scenarios.map(([ko, en, answer], index) => ({
    prompt: text(ko, en),
    choices: [actions[answer], ...actions.filter((_, candidate) => candidate !== answer).filter((_, candidate) => candidate >= index % (actions.length - 3)).slice(0, 3)].map(([a, b]) => text(a, b)),
    answerIndex: 0,
  }));
}

const release = mission([
  ["실패한 검사를 배포 차단 조건으로 둔다", "Block delivery when a required check fails"],
  ["테스트한 불변 결과물을 그대로 승격한다", "Promote the same tested immutable artifact"],
  ["소량 트래픽으로 기존 버전과 비교한다", "Compare a small canary with the existing version"],
  ["미리 검증한 이전 버전으로 되돌린다", "Roll back to a previously verified version"],
  ["소스·의존성·설정과 버전을 기록한다", "Record source, dependencies, configuration and versions"],
  ["비밀은 저장소·결과물·로그에서 분리한다", "Keep secrets out of repositories, artifacts and logs"],
], [
  ["필수 테스트가 빨간색인데 출항을 재촉한다. 소라게는 무엇을 해야 할까?", "Required tests are red, but departure is urgent. What should the hermit do?", 0],
  ["검증 서버와 운영 서버에서 다시 빌드해 결과물이 달라졌다. 개선책은?", "Staging and production rebuilt different artifacts. What should change?", 1],
  ["새 항로의 위험을 전체 승객에게 바로 노출하지 않으려면?", "How can a new route be tried without immediately exposing every passenger?", 2],
  ["새 배포 직후 오류가 급증했고 이전 버전은 정상이다. 준비된 완화책은?", "Errors spike after a release while the previous version works. What prepared mitigation fits?", 3],
  ["같은 커밋이 어제와 다르게 동작한다. 재현을 위해 무엇을 남겨야 할까?", "The same commit behaves differently today. What helps reproduce the build?", 4],
  ["빌드 로그에 서비스 토큰이 찍혔다. 이후 파이프라인에서 지킬 원칙은?", "A service token appeared in build logs. Which pipeline principle must be enforced?", 5],
  ["보안 검사 실패를 무시하도록 설정돼 있다. 안전한 출항 조건은?", "A failed required security check is ignored. What is the safer departure condition?", 0],
  ["QA가 승인한 파일과 운영에 올린 파일이 다르다. 무엇을 보장해야 할까?", "QA approved one file but production received another. What must be guaranteed?", 1],
  ["새 버전이 일부 승객에게만 느린지 알고 싶다. 어떤 출시 방식이 적합할까?", "How should a release test whether only some passengers experience new latency?", 2],
  ["복구 절차에 이전 이미지 버전이 없다. 어떤 대응을 미리 연습해야 할까?", "Recovery instructions lack a previous image version. What response needs rehearsal?", 3],
  ["개발 PC에만 있던 도구 때문에 CI가 실패한다. 어떤 기록이 빠졌을까?", "CI fails because a tool existed only on a developer's computer. What record was missing?", 4],
  ["컨테이너 이미지 안에 API 키가 들어간다. 어떤 원칙을 적용할까?", "An API key is baked into a container image. Which principle applies?", 5],
  ["필수 검사 하나가 건너뛰어졌는데 배포가 진행됐다. 출항문은 무엇을 확인해야 할까?", "A skipped required check still allowed delivery. What should the release gate enforce?", 0],
  ["테스트 뒤 같은 태그를 다른 파일로 덮었다. 어떤 승격 정책이 필요한가?", "A tag was overwritten with another file after testing. What promotion policy is needed?", 1],
  ["전체 배포 전 후보 버전과 대조군의 오류율을 보고 싶다. 무엇을 할까?", "Before a full rollout, how can candidate and control error rates be compared?", 2],
  ["배포 중 장애가 발생했다. 이미 연습한 되돌리기 경로가 있다면?", "A release causes an incident and a tested reversal path exists. Which action fits?", 3],
  ["의존성이 자동으로 최신 버전으로 바뀌어 빌드가 달라졌다. 재현성에 필요한 것은?", "Unpinned dependencies changed a build. What supports reproducibility?", 4],
  ["설정 예제 파일에 실제 비밀번호를 넣으려 한다. 어떤 규칙을 지킬까?", "Someone wants a real password in an example configuration. Which rule should apply?", 5],
  ["파이프라인이 성공한 척하지만 필수 테스트는 실행되지 않았다. 무엇을 바로잡을까?", "A pipeline claims success without running required tests. What must be corrected?", 0],
  ["검증과 출항 사이에 파일이 교체될 위험을 없애려면?", "How can artifact substitution between validation and departure be prevented?", 1],
]);

const observe = mission([
  ["시간에 따른 수치 지표를 비교한다", "Compare numerical metrics over time"],
  ["해당 시점의 구조화된 로그를 조사한다", "Investigate structured logs for that time"],
  ["같은 요청의 분산 추적과 span을 연결한다", "Follow the request's distributed trace and spans"],
  ["평균뿐 아니라 지연 시간 분포를 본다", "Inspect the latency distribution, not just its mean"],
  ["사용자 영향과 연결되는 신호를 확인한다", "Check signals tied to user-visible impact"],
  ["메트릭 라벨의 종류 수를 제한한다", "Bound the number of distinct metric label values"],
], [
  ["부엉이가 지난 한 시간의 초당 요청 수 추세를 묻는다. 무엇을 볼까?", "The owl asks for the request-rate trend over an hour. What should you inspect?", 0],
  ["특정 오류가 어떤 입력에서 발생했는지 사건 기록이 필요하다. 무엇을 조사할까?", "You need an event record explaining which input caused an error. What should you inspect?", 1],
  ["요청 하나가 세 서비스를 거친다. 어느 호출이 느린지 찾으려면?", "One request crosses three services. How can you locate the slow call?", 2],
  ["평균 응답은 빠른데 일부 승객이 매우 오래 기다린다. 무엇을 살펴야 할까?", "Mean response time is good but some passengers wait far longer. What should you examine?", 3],
  ["서버 CPU는 정상인데 결제가 실패한다. 어떤 관측 관점이 필요한가?", "Server CPU is normal but checkout fails. Which monitoring perspective is missing?", 4],
  ["모든 요청 ID를 메트릭 라벨에 넣어 시계열이 폭증했다. 개선책은?", "Using every request ID as a metric label explodes time-series counts. What should change?", 5],
  ["배포 전후 오류 비율이 늘었는지 수치 추세를 비교하려면?", "How should you compare numerical error-ratio trends before and after a release?", 0],
  ["오류 코드와 함께 남긴 사건별 메시지를 찾고 싶다. 무엇을 읽을까?", "Where should you look for individual event messages carrying error codes?", 1],
  ["프록시와 API와 저장소의 동일 요청을 이어 보고 싶다. 무엇을 활용할까?", "How can you connect one request across proxy, API and storage?", 2],
  ["p99가 높지만 평균은 그대로다. 무엇을 더 자세히 봐야 할까?", "The p99 rises while the mean stays stable. What deserves a closer look?", 3],
  ["호스트는 살아 있지만 사용자가 항로를 예약하지 못한다. 어떤 신호가 중요한가?", "The host is alive but users cannot book a route. Which signals matter?", 4],
  ["사용자 이메일을 메트릭 라벨로 써서 비용이 커졌다. 어떤 설계 원칙을 적용할까?", "Email-address metric labels increase costs. Which design principle applies?", 5],
  ["포화도가 매일 같은 시간에 치솟는지 알고 싶다. 무엇을 비교할까?", "You want to know whether saturation spikes at the same time daily. What should you compare?", 0],
  ["한 작업이 실패한 직전의 오류 상세가 필요하다. 어떤 자료를 조사할까?", "You need error details immediately before one job failed. Which evidence should you inspect?", 1],
  ["한 페이지 요청의 시간이 어느 하위 호출에 쓰였는지 알고 싶다. 무엇을 볼까?", "How can you see which downstream calls consumed one page request's time?", 2],
  ["일부 지역만 긴 대기를 겪는다. 평균 하나로 가려진 현상을 확인하려면?", "Long waits affect only some regions. How can you uncover what a global mean hides?", 3],
  ["배경 작업 하나의 경보만으로 승객 피해를 단정했다. 무엇을 추가 확인할까?", "A background-job alert was treated as proof of passenger harm. What else should be checked?", 4],
  ["URL 전체 경로에 주문 번호가 들어 있어 시계열이 계속 늘어난다. 개선책은?", "Order IDs in full URL labels create endless series. What should be improved?", 5],
  ["등대가 매분 측정한 성공 요청 수의 변화를 보고 싶다. 어떤 자료를 쓸까?", "You want changes in successful-request counts measured each minute. Which evidence fits?", 0],
  ["장애 당시 특정 요청의 예외 메시지를 찾으려면?", "Where would you search for one request's exception message during an incident?", 1],
]);

const objectives = mission([
  ["성공한 유효 이벤트를 전체 유효 이벤트로 나눈다", "Divide good valid events by all valid events"],
  ["사용자 경험에 맞는 측정 가능한 SLO를 정한다", "Set a measurable SLO grounded in user experience"],
  ["오류 예산 비율을 1에서 SLO를 빼서 구한다", "Calculate the error-budget fraction as one minus the SLO"],
  ["오류 예산 소진 속도를 관측한다", "Observe the error-budget burn rate"],
  ["합의한 정책에 따라 신뢰성 개선을 우선한다", "Prioritize reliability under the agreed policy"],
  ["측정 창과 유효 이벤트 범위를 명시한다", "Define the measurement window and eligible events"],
], [
  ["거북이 요청 성공률 SLI의 분자를 묻는다. 어떤 계산을 할까?", "The turtle asks how to calculate a request-success SLI. Which calculation fits?", 0],
  ["사용자가 기다릴 수 있는 시간에 대한 약속을 만들려면?", "How should you establish a promise about how long users can wait?", 1],
  ["SLO가 99.9%일 때 허용 실패 비율을 구하려면?", "How do you obtain the allowed failure fraction for a 99.9% SLO?", 2],
  ["지금 속도라면 월간 예산이 며칠 만에 사라질지 알고 싶다. 무엇을 볼까?", "You want to know how quickly the monthly budget would disappear at the current pace. What should you observe?", 3],
  ["오류 예산이 소진됐고 팀 정책은 기능 배포를 쉬도록 한다. 무엇을 우선할까?", "The budget is exhausted and team policy pauses feature launches. What should take priority?", 4],
  ["팀마다 성공률 수치가 다르다. 같은 계산을 위해 먼저 무엇을 맞출까?", "Teams report different success ratios. What must be aligned before comparing them?", 5],
  ["유효 요청 1,000개 중 995개가 성공했다. SLI 계산 원칙은?", "995 out of 1,000 eligible requests succeed. Which SLI rule applies?", 0],
  ["운영 서버 수만으로 사용자 약속을 정하려 한다. 더 나은 목표 설정은?", "A team wants a user promise based only on server count. What is a better approach?", 1],
  ["99% 목표에서 남은 1%가 무엇인지 계산하는 원리는?", "Which rule derives the 1% allowance from a 99% target?", 2],
  ["실패 비율이 잠깐 높아졌을 때 지속되면 얼마나 위험한지 보고 싶다. 무엇을 추적할까?", "A failure spike appears. What tells you the risk if that rate persists?", 3],
  ["예산 초과 시 행동이 이미 합의돼 있다. 신규 기능보다 무엇을 먼저 할까?", "The team agreed what to do after overspending. What should precede new features?", 4],
  ["지난달 수치와 오늘 5분 수치를 같은 조건처럼 비교했다. 무엇을 명시해야 할까?", "Last month's result was compared directly with five minutes today. What needs to be defined?", 5],
  ["요청 기반 가용성 지표에 필요한 좋은 이벤트 비율은?", "Which ratio is needed for request-based availability?", 0],
  ["무조건 100%라는 목표 대신 팀이 정해야 할 것은?", "What should a team establish instead of automatically targeting 100%?", 1],
  ["요청 기반 SLO의 허용 실패 몫을 식으로 나타내면?", "Which formula gives the allowed failure share for an event-based SLO?", 2],
  ["오류 총량만으로는 최근 악화를 놓친다. 예산 위험을 알려줄 신호는?", "A total error count hides recent deterioration. Which signal reveals budget risk?", 3],
  ["팀이 정한 예산 정책에 따라 위험한 변경을 늦춰야 한다. 어떤 선택이 맞을까?", "The agreed budget policy calls for slowing risky changes. Which choice fits?", 4],
  ["로드 테스트 트래픽을 사용자 SLI에 넣을지 팀이 다르게 이해한다. 무엇을 합의할까?", "Teams disagree about including load-test traffic in the user SLI. What should they agree on?", 5],
  ["유효 이벤트 100개에서 실패 2개를 뺀 성공 98개의 비율을 구하려면?", "How should you calculate the ratio of 98 good events among 100 valid events?", 0],
  ["등대 서버의 내부 수치보다 승객의 예약 성공을 반영하는 약속은 어떻게 정할까?", "How should a promise reflect successful bookings rather than only internal beacon-server readings?", 1],
]);

const incident = mission([
  ["영향을 줄이는 검증된 완화책을 우선한다", "Prioritize a verified mitigation that reduces impact"],
  ["지휘·운영·소통 역할을 분명히 나눈다", "Assign clear command, operations and communication roles"],
  ["시각·증상·조치와 결과를 공유 기록에 남긴다", "Record times, symptoms, actions and results in shared notes"],
  ["확인된 영향과 다음 안내 시점을 알린다", "Communicate confirmed impact and the next update time"],
  ["정한 기준에 따라 추가 대응자를 호출한다", "Escalate to additional responders using agreed criteria"],
  ["가설을 근거로 검증하고 불확실성을 표시한다", "Test hypotheses against evidence and mark uncertainty"],
], [
  ["왜가리는 원인 토론 중에도 승객이 피해를 보고 있음을 발견했다. 우선순위는?", "The heron sees passengers suffering while root causes are debated. What comes first?", 0],
  ["여러 대응자가 같은 설정을 동시에 바꾸고 있다. 먼저 정리할 것은?", "Several responders change the same settings at once. What should be organized?", 1],
  ["교대자가 이전 대응 과정을 모른다. 어떤 자료가 필요할까?", "A replacement responder does not know what has been tried. What evidence is needed?", 2],
  ["승객에게 원인이 확정되지 않은 상태에서 안내해야 한다. 무엇을 전달할까?", "Passengers need an update before the cause is known. What should be communicated?", 3],
  ["현재 대응팀의 권한으로 복구할 수 없다. 어떤 절차를 따를까?", "The current responders lack recovery permissions. Which process should they follow?", 4],
  ["직전 배포가 원인이라는 추측만 있다. 어떻게 다뤄야 할까?", "There is only a guess that the latest release caused the issue. How should it be handled?", 5],
  ["검증된 트래픽 우회가 즉시 영향을 줄일 수 있다. 무엇을 우선할까?", "A verified traffic diversion can immediately reduce harm. What deserves priority?", 0],
  ["운영 작업과 외부 안내를 한 사람이 놓치고 있다. 어떤 조직화가 필요할까?", "One person cannot keep up with operations and external updates. What organization helps?", 1],
  ["어떤 변경 이후 오류가 줄었는지 잊었다. 무엇을 남겨야 할까?", "Nobody remembers which change reduced errors. What should have been kept?", 2],
  ["예상 복구 시간을 모른다. 사용자에게 어떻게 알릴까?", "Recovery time is unknown. How should users be updated?", 3],
  ["영향이 정해 둔 심각도 기준을 넘었다. 무엇을 할까?", "Impact exceeds the agreed severity threshold. Which action fits?", 4],
  ["한 로그만 보고 저장소 고장을 단정하려 한다. 더 나은 판단 방법은?", "Someone wants to declare storage broken from a single log. What is a better reasoning method?", 5],
  ["문제 버전을 되돌리는 연습을 이미 마쳤고 그것이 피해를 줄인다. 우선할 것은?", "A rehearsed rollback is known to reduce this harm. What takes priority?", 0],
  ["서로 다른 지휘자가 상충하는 지시를 낸다. 어떤 합의가 필요한가?", "Competing leaders give contradictory instructions. Which agreement is needed?", 1],
  ["복구 담당자가 바뀌어도 실험과 결과를 이어가려면?", "How can experiments and results remain available when responders change?", 2],
  ["확인되지 않은 원인과 확정된 영향이 섞여 안내됐다. 소통에서 지킬 것은?", "An update mixes an unverified cause with confirmed impact. Which communication rule matters?", 3],
  ["당직자가 응답하지 않아 정해진 대기 시간을 넘겼다. 무엇을 따를까?", "The on-call responder has missed the agreed response time. What should happen?", 4],
  ["처음 세운 가설과 새 증거가 다르다. 올바른 조사 태도는?", "New evidence contradicts the first hypothesis. Which investigation practice fits?", 5],
  ["근본 원인을 찾는 데 오래 걸리지만 안전한 임시 우회가 있다. 먼저 할 일은?", "Root-cause analysis will take time but a safe workaround exists. What comes first?", 0],
  ["사고 중 변경 승인과 실행 책임이 불명확하다. 무엇을 명확히 해야 할까?", "During an incident, change approval and execution responsibilities are unclear. What must be clarified?", 1],
]);

const recovery = mission([
  ["대표 사용자 여정과 성공 신호를 함께 확인한다", "Verify representative user journeys and success signals together"],
  ["관측 기간을 두고 재발·밀린 작업을 확인한다", "Observe for recurrence and outstanding work over a suitable period"],
  ["개인 비난 대신 시스템과 대응 과정을 분석한다", "Analyze systems and response processes without personal blame"],
  ["담당자·기한·검증 방법이 있는 개선 작업을 만든다", "Create improvements with owners, deadlines and verification"],
  ["복구 절차를 연습하고 실제와 맞게 갱신한다", "Rehearse recovery procedures and keep them accurate"],
  ["진단에 필요한 근거를 안전하게 보존한다", "Safely preserve evidence needed for diagnosis"],
], [
  ["수호룡이 서버 응답만으로 복구를 선언하지 말라고 한다. 무엇을 확인할까?", "The guardian says a responding server is not proof of recovery. What should be verified?", 0],
  ["첫 성공 요청은 돌아왔지만 대기열이 아직 크다. 다음 확인은?", "The first request succeeds but the backlog remains large. What comes next?", 1],
  ["회고가 실수한 사람 찾기로 흐른다. 방향을 어떻게 바꿀까?", "A review turns into finding someone to blame. How should its focus change?", 2],
  ["회고 결론이 '다음에는 조심하자'뿐이다. 무엇으로 바꿀까?", "A review ends only with 'be more careful'. What should replace that?", 3],
  ["문서 속 복구 명령이 실제와 다르다. 어떤 작업이 필요한가?", "Recovery commands in the guide no longer match reality. What work is needed?", 4],
  ["조사를 마치기 전에 사고 로그가 만료된다. 어떤 원칙을 따를까?", "Incident logs will expire before the investigation finishes. Which practice applies?", 5],
  ["홈 화면은 열리지만 예약 완료는 실패한다. 복구 확인 기준은?", "The home page opens but booking completion fails. Which recovery check matters?", 0],
  ["오류율이 잠깐 내려갔다 다시 오를 수 있다. 무엇이 필요한가?", "The error rate may fall briefly and then rise again. What is needed?", 1],
  ["같은 실수를 막기 위해 개인의 기억에만 의존한다. 회고에서 볼 것은?", "Prevention relies only on one person's memory. What should the review examine?", 2],
  ["재발 방지 항목이 있는데 누가 할지 모른다. 무엇을 구체화할까?", "A prevention item exists but nobody owns it. What needs to be made concrete?", 3],
  ["안전한 우회를 다음 당직자도 사용할 수 있게 하려면?", "How can the next on-call responder use the safe workaround?", 4],
  ["장애 재현에 필요한 추적 자료에 개인정보가 있다. 어떻게 다룰까?", "Traces needed for reproduction contain personal information. How should they be handled?", 5],
  ["건강 검사 통과와 실제 항해 성공을 함께 판단하려면?", "How should you judge both a passing health check and a successful real voyage?", 0],
  ["복구 뒤 재시도 작업이 계속 쌓이는지 보고 싶다. 무엇을 할까?", "You want to know whether retry work continues piling up after recovery. What should you do?", 1],
  ["운영자가 왜 그 선택을 했는지 당시 정보를 이해하려 한다. 어떤 회고가 적절할까?", "You want to understand a responder's choice using the information available then. Which review approach fits?", 2],
  ["개선 배포가 정말 같은 장애를 막는지 확인하려면 어떤 항목이 필요할까?", "What kind of improvement item can prove that a change prevents the same failure?", 3],
  ["복구 안내서를 읽기만 하고 한 번도 실행하지 않았다. 다음 조치는?", "The recovery guide has been read but never exercised. What is the next step?", 4],
  ["회고에서 시간 순서를 재구성할 자료를 잃지 않으려면?", "How can evidence for reconstructing the incident timeline be kept available?", 5],
  ["새 버전에서 사용자의 핵심 동작이 실제로 돌아왔는지 무엇으로 확인할까?", "What should confirm that a user's essential action really works again in the new version?", 0],
  ["장애 종료 직후 미처리 요청과 지연 회복을 놓치지 않으려면?", "How can outstanding requests and lingering latency be caught just after mitigation?", 1],
]);

export const PLATFORM_QUIZZES: readonly (readonly QuizQuestion[])[] = [release, observe, objectives, incident, recovery];
