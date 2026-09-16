import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 build-runner — Build */
const buildRunnerQuiz: readonly QuizQuestion[] = [
  question(
    ["빌드가 하는 일은?", "What does a build do?"],
    [["소스 코드를 실행 가능한 산출물로 만든다", "It turns source code into a runnable artifact"], ["코드를 저장소에 올린다", "It uploads code to the repository"], ["서버를 재시작한다", "It restarts the server"], ["로그를 수집한다", "It collects logs"]]
  ),
  question(
    ["빌드가 만들어 내는 결과물을 부르는 말은?", "What is the output of a build called?"],
    [["아티팩트", "An artifact"], ["커밋", "A commit"], ["브랜치", "A branch"], ["러너", "A runner"]]
  ),
  question(
    ["같은 커밋을 빌드하면 항상 같은 결과가 나와야 하는 성질은?", "What property says building the same commit always yields the same output?"],
    [["재현 가능한 빌드", "Reproducible builds"], ["원자적 배포", "Atomic deployment"], ["무중단 전환", "Zero-downtime cutover"], ["점진적 릴리스", "Progressive release"]]
  ),
  question(
    ["내 컴퓨터에서는 되는데 CI에서만 실패하는 흔한 원인은?", "What commonly makes a build pass locally but fail in CI?"],
    [["로컬에만 있는 도구나 환경 변수에 의존한다", "It depends on tools or environment variables that exist only locally"], ["CI 서버가 항상 느리기 때문이다", "CI servers are always slower"], ["커밋 메시지가 짧기 때문이다", "The commit message is too short"], ["브랜치 이름이 길기 때문이다", "The branch name is too long"]]
  ),
  question(
    ["의존성 버전을 잠금 파일로 고정하는 이유는?", "Why pin dependency versions with a lock file?"],
    [["언제 빌드해도 같은 버전을 설치한다", "The same versions install no matter when you build"], ["설치가 항상 빨라진다", "Installation is always faster"], ["패키지 수가 줄어든다", "It reduces the number of packages"], ["보안 검사가 불필요해진다", "It removes the need for security scans"]]
  ),
  question(
    ["CI에서 의존성 캐시를 쓰는 이유는?", "Why cache dependencies in CI?"],
    [["매번 내려받지 않아 빌드 시간이 줄어든다", "It avoids re-downloading and shortens build time"], ["보안이 강해진다", "It improves security"], ["아티팩트가 작아진다", "The artifact gets smaller"], ["테스트가 생략된다", "Tests are skipped"]]
  ),
  question(
    ["빌드 실패를 발견했을 때 팀의 우선순위는?", "What is a team's priority when the build breaks?"],
    [["다른 작업보다 먼저 빌드를 초록으로 되돌린다", "Getting the build green again before other work"], ["실패한 채로 다음 기능을 이어 간다", "Continuing the next feature while it stays red"], ["알림을 끈다", "Turning off the notifications"], ["테스트를 건너뛴다", "Skipping the tests"]]
  ),
  question(
    ["CI가 빌드를 시작하게 하는 일반적인 계기는?", "What usually triggers a CI build?"],
    [["푸시나 풀 리퀘스트 같은 저장소 이벤트", "Repository events such as a push or a pull request"], ["담당자가 매일 수동 실행", "A person running it manually each day"], ["서버 재부팅", "A server reboot"], ["디스크 용량 변화", "A change in disk usage"]]
  ),
  question(
    ["빌드 로그에 비밀 값이 출력되면?", "What if a secret value is printed in the build log?"],
    [["노출된 것으로 보고 즉시 폐기하고 재발급해야 한다", "Treat it as exposed: revoke and reissue it at once"], ["로그는 비공개이므로 안전하다", "Logs are private, so it is safe"], ["다음 빌드에서 자동으로 지워진다", "The next build erases it automatically"], ["문제가 되지 않는다", "It is not a problem"]]
  ),
  question(
    ["빌드 단계를 짧게 유지하면 좋은 이유는?", "Why keep the build stage short?"],
    [["피드백이 빨라 문제를 일찍 고칠 수 있다", "Faster feedback means problems are fixed earlier"], ["아티팩트가 작아진다", "The artifact gets smaller"], ["테스트가 필요 없어진다", "Tests become unnecessary"], ["배포가 자동으로 안전해진다", "Deployment becomes automatically safe"]]
  ),
];

/** LV.2 test-relay — Automated test */
const testRelayQuiz: readonly QuizQuestion[] = [
  question(
    ["CI에서 테스트를 자동 실행하는 이유는?", "Why run tests automatically in CI?"],
    [["변경마다 결함을 빠르게 찾아낸다", "Defects surface quickly on every change"], ["코드 스타일을 통일한다", "It unifies code style"], ["빌드를 생략하기 위해서다", "So the build can be skipped"], ["배포 속도만 높인다", "It only speeds up deployment"]]
  ),
  question(
    ["테스트가 실패했을 때 파이프라인이 해야 할 일은?", "What should a pipeline do when tests fail?"],
    [["다음 단계로 넘어가지 않고 멈춘다", "Stop and refuse to move to the next stage"], ["경고만 남기고 배포한다", "Warn and deploy anyway"], ["실패한 테스트를 자동 삭제한다", "Delete the failing tests automatically"], ["재시도를 무한 반복한다", "Retry forever"]]
  ),
  question(
    ["PR마다 테스트를 돌리는 방식의 이점은?", "What is the benefit of running tests on every pull request?"],
    [["문제가 기본 브랜치에 합쳐지기 전에 걸러진다", "Problems are caught before they merge into the main branch"], ["리뷰가 필요 없어진다", "Code review becomes unnecessary"], ["빌드 시간이 줄어든다", "Build time drops"], ["테스트를 덜 써도 된다", "Fewer tests are needed"]]
  ),
  question(
    ["CI에서 테스트를 병렬로 나누는 이유는?", "Why split tests across parallel jobs in CI?"],
    [["전체 실행 시간을 줄인다", "It cuts total wall-clock time"], ["테스트 수를 줄인다", "It reduces the number of tests"], ["커버리지를 높인다", "It raises coverage"], ["실패를 숨긴다", "It hides failures"]]
  ),
  question(
    ["실패할 가능성이 큰 빠른 검사를 앞쪽에 두는 이유는?", "Why put fast, likely-to-fail checks early in the pipeline?"],
    [["문제를 일찍 알려 대기 시간을 줄인다", "It reports problems sooner and reduces waiting"], ["검사 수를 줄인다", "It reduces the number of checks"], ["느린 검사를 생략한다", "It skips the slow checks"], ["로그를 줄인다", "It produces fewer logs"]]
  ),
  question(
    ["CI에서 플레이키 테스트를 재시도로만 덮으면?", "What if flaky tests in CI are papered over with retries?"],
    [["진짜 결함까지 통과시켜 신뢰를 잃는다", "Real defects slip through and trust in CI erodes"], ["테스트가 안정된다", "The tests become stable"], ["실행 시간이 줄어든다", "Run time decreases"], ["커버리지가 올라간다", "Coverage rises"]]
  ),
  question(
    ["코드 스타일과 잠재 오류를 자동 검사하는 도구는?", "Which tool automatically checks code style and likely errors?"],
    [["린터", "A linter"], ["프로파일러", "A profiler"], ["디버거", "A debugger"], ["패키저", "A packager"]]
  ),
  question(
    ["머지 전에 통과해야 하는 검사를 강제하는 설정은?", "Which setting enforces checks that must pass before a merge?"],
    [["필수 상태 검사와 브랜치 보호 규칙", "Required status checks with branch protection"], ["커밋 메시지 규칙", "A commit message convention"], ["코드 소유자 목록만", "A code owners list alone"], ["이슈 템플릿", "An issue template"]]
  ),
  question(
    ["CI에서 테스트가 통과했다는 사실이 보장하지 않는 것은?", "What does a green CI run NOT guarantee?"],
    [["운영 환경에서도 문제가 없다는 것", "That nothing will go wrong in production"], ["테스트가 실행됐다는 것", "That the tests ran"], ["코드가 빌드됐다는 것", "That the code compiled"], ["검사가 설정돼 있다는 것", "That checks are configured"]]
  ),
  question(
    ["테스트 결과를 팀이 잘 활용하려면 필요한 것은?", "What helps a team actually act on test results?"],
    [["무엇이 왜 실패했는지 바로 알 수 있는 리포트", "A report that shows what failed and why at a glance"], ["로그를 모두 숨긴다", "Hiding all the logs"], ["결과를 메일로만 보낸다", "Emailing results only"], ["실패를 집계하지 않는다", "Not tracking failures at all"]]
  ),
];

/** LV.3 pipeline-relay — Pipeline */
const pipelineRelayQuiz: readonly QuizQuestion[] = [
  question(
    ["파이프라인이 하는 일은?", "What does a pipeline do?"],
    [["빌드, 테스트, 배포 단계를 자동화된 흐름으로 잇는다", "It connects build, test and deploy stages into an automated flow"], ["코드를 작성한다", "It writes the code"], ["서버를 구매한다", "It provisions hardware"], ["이슈를 생성한다", "It files issues"]]
  ),
  question(
    ["파이프라인을 코드로 저장소에 두면 좋은 점은?", "What is the benefit of keeping the pipeline as code in the repository?"],
    [["변경 이력이 남고 리뷰할 수 있다", "Changes are versioned and reviewable"], ["실행이 빨라진다", "It runs faster"], ["테스트가 필요 없어진다", "Tests become unnecessary"], ["비밀 값을 안전하게 담을 수 있다", "Secrets can be stored safely in it"]]
  ),
  question(
    ["앞 단계가 성공해야 다음 단계가 실행되는 관계는?", "What relationship makes a stage wait for the previous one to succeed?"],
    [["단계 간 의존성", "A stage dependency"], ["병렬 실행", "Parallel execution"], ["캐시", "Caching"], ["아티팩트 보존", "Artifact retention"]]
  ),
  question(
    ["단계 사이에 빌드 산출물을 전달하는 방법은?", "How do you pass a build output between stages?"],
    [["아티팩트로 업로드하고 다음 단계에서 내려받는다", "Upload it as an artifact and download it in the next stage"], ["소스를 다시 빌드한다", "Rebuild the source again"], ["로그에 복사해 둔다", "Copy it into the log"], ["커밋으로 푸시한다", "Push it back as a commit"]]
  ),
  question(
    ["단계마다 다시 빌드하지 않고 한 번 만든 산출물을 쓰는 이유는?", "Why reuse one build artifact instead of rebuilding per stage?"],
    [["테스트한 바로 그 산출물이 배포되도록 보장한다", "It guarantees the artifact you tested is the one you deploy"], ["빌드가 필요 없어진다", "Builds become unnecessary"], ["테스트를 줄일 수 있다", "Fewer tests are needed"], ["로그가 짧아진다", "The logs get shorter"]]
  ),
  question(
    ["파이프라인에서 비밀 값을 다루는 올바른 방법은?", "What is the correct way to handle secrets in a pipeline?"],
    [["시크릿 저장소에서 주입하고 로그에 마스킹한다", "Inject them from a secret store and mask them in logs"], ["설정 파일에 평문으로 적는다", "Write them as plaintext in the config"], ["커밋 메시지에 남긴다", "Record them in the commit message"], ["환경마다 하드코딩한다", "Hardcode them per environment"]]
  ),
  question(
    ["사람이 확인한 뒤에만 다음 단계로 가게 하는 장치는?", "Which mechanism holds a stage until a person confirms it?"],
    [["수동 승인 게이트", "A manual approval gate"], ["재시도 정책", "A retry policy"], ["타임아웃", "A timeout"], ["캐시 무효화", "Cache invalidation"]]
  ),
  question(
    ["파이프라인 실행 시간이 길어질 때 먼저 볼 것은?", "What should you look at first when pipeline runs grow long?"],
    [["가장 오래 걸리는 단계와 반복되는 작업", "The slowest stage and the work being repeated"], ["커밋 메시지 길이", "The commit message length"], ["브랜치 개수", "The number of branches"], ["이슈 라벨", "The issue labels"]]
  ),
  question(
    ["여러 단계가 서로 독립적일 때 취할 수 있는 조치는?", "What can you do when several stages are independent of each other?"],
    [["병렬로 실행한다", "Run them in parallel"], ["순서를 강제한다", "Force them into a sequence"], ["하나로 합친다", "Merge them into one"], ["모두 제거한다", "Remove them all"]]
  ),
  question(
    ["기본 브랜치와 기능 브랜치에서 파이프라인을 다르게 두는 이유는?", "Why run different pipelines on the main branch and feature branches?"],
    [["기능 브랜치는 빠른 검증, 기본 브랜치는 배포까지 책임진다", "Feature branches need fast checks; the main branch carries deployment"], ["브랜치 이름이 다르기 때문이다", "Because the branch names differ"], ["기본 브랜치는 테스트가 필요 없어서다", "Because the main branch needs no tests"], ["기능 브랜치는 빌드가 불가능해서다", "Because feature branches cannot be built"]]
  ),
];

/** LV.4 deployment-conductor — Deployment */
const deploymentConductorQuiz: readonly QuizQuestion[] = [
  question(
    ["배포(deployment)가 하는 일은?", "What does a deployment do?"],
    [["검증된 산출물을 실행 환경에 반영한다", "It releases a verified artifact into a runtime environment"], ["소스 코드를 작성한다", "It writes source code"], ["테스트를 작성한다", "It writes tests"], ["이슈를 닫는다", "It closes issues"]]
  ),
  question(
    ["지속적 배포(CD)와 지속적 전달의 차이는?", "How does continuous deployment differ from continuous delivery?"],
    [["지속적 배포는 승인 없이 운영까지 자동으로 나간다", "Continuous deployment reaches production automatically, with no approval step"], ["지속적 전달은 테스트를 하지 않는다", "Continuous delivery skips testing"], ["둘은 완전히 같다", "They are exactly the same"], ["지속적 배포는 수동으로만 한다", "Continuous deployment is always manual"]]
  ),
  question(
    ["구 버전과 신 버전을 나란히 띄운 뒤 트래픽을 한 번에 전환하는 방식은?", "Which strategy runs old and new side by side and switches traffic at once?"],
    [["블루-그린 배포", "Blue-green deployment"], ["카나리 배포", "Canary deployment"], ["롤링 업데이트", "A rolling update"], ["빅뱅 배포", "A big-bang deployment"]]
  ),
  question(
    ["일부 사용자에게만 먼저 새 버전을 노출하는 방식은?", "Which strategy exposes the new version to a small share of users first?"],
    [["카나리 배포", "Canary deployment"], ["블루-그린 배포", "Blue-green deployment"], ["빅뱅 배포", "A big-bang deployment"], ["핫픽스 배포", "A hotfix deployment"]]
  ),
  question(
    ["인스턴스를 조금씩 교체해 무중단으로 넘기는 방식은?", "Which strategy replaces instances gradually with no downtime?"],
    [["롤링 업데이트", "A rolling update"], ["블루-그린 배포", "Blue-green deployment"], ["재시작 배포", "A stop-and-start deployment"], ["수동 복사", "A manual copy"]]
  ),
  question(
    ["코드 배포와 기능 공개를 분리해 주는 기법은?", "Which technique separates deploying code from releasing a feature?"],
    [["기능 플래그", "Feature flags"], ["롤백", "Rollback"], ["샤딩", "Sharding"], ["캐시 워밍", "Cache warming"]]
  ),
  question(
    ["배포 직후 가장 먼저 확인해야 할 것은?", "What should you check first right after a deploy?"],
    [["오류율과 응답 시간 같은 핵심 지표", "Core signals such as error rate and latency"], ["코드 스타일", "Code style"], ["커밋 개수", "The commit count"], ["문서 오탈자", "Typos in the docs"]]
  ),
  question(
    ["데이터베이스 스키마 변경을 배포할 때 안전한 순서는?", "What is a safe order for deploying a schema change?"],
    [["호환되는 변경을 먼저 적용하고 코드 배포 뒤 정리한다", "Apply the backward-compatible change first, deploy the code, then clean up"], ["열을 먼저 삭제하고 코드를 배포한다", "Drop the column first, then deploy the code"], ["코드와 스키마를 동시에 갈아엎는다", "Swap code and schema simultaneously"], ["스키마는 배포 대상이 아니다", "Schemas are not part of a deployment"]]
  ),
  question(
    ["금요일 저녁 대규모 배포가 위험한 이유는?", "Why is a large Friday-evening deploy risky?"],
    [["문제가 생겼을 때 대응할 사람이 적다", "Fewer people are around to respond when something breaks"], ["빌드가 느려지기 때문이다", "Builds are slower then"], ["테스트가 실행되지 않기 때문이다", "Tests do not run then"], ["아티팩트가 만료되기 때문이다", "Artifacts expire then"]]
  ),
  question(
    ["자주, 작게 배포하는 방식의 장점은?", "What is the advantage of deploying small changes often?"],
    [["문제 범위가 좁아 원인을 찾고 되돌리기 쉽다", "A small change is easy to trace and easy to undo"], ["테스트가 필요 없어진다", "Tests become unnecessary"], ["배포 시간이 항상 0이 된다", "Deploy time drops to zero"], ["모니터링이 필요 없어진다", "Monitoring becomes unnecessary"]]
  ),
];

/** LV.5 release-conductor — Rollback */
const releaseConductorQuiz: readonly QuizQuestion[] = [
  question(
    ["롤백이 하는 일은?", "What does a rollback do?"],
    [["문제가 생긴 배포를 이전 안정 버전으로 되돌린다", "It returns a faulty release to a previously stable version"], ["새 기능을 추가한다", "It adds a new feature"], ["테스트를 다시 실행한다", "It reruns the tests"], ["로그를 삭제한다", "It deletes the logs"]]
  ),
  question(
    ["장애 상황에서 원인 분석보다 롤백을 먼저 고려하는 이유는?", "Why consider rollback before root-cause analysis during an incident?"],
    [["사용자 영향을 먼저 멈추는 것이 우선이다", "Stopping user impact comes first"], ["원인 분석은 필요 없기 때문이다", "Because root-cause analysis is unnecessary"], ["롤백이 더 재미있기 때문이다", "Because rollback is more interesting"], ["로그가 사라지기 때문이다", "Because the logs disappear"]]
  ),
  question(
    ["롤백을 빠르게 하려면 배포가 갖춰야 할 조건은?", "What must a deployment have for rollback to be fast?"],
    [["이전 버전 아티팩트가 그대로 남아 있어야 한다", "The previous version's artifact must still be available"], ["소스를 다시 빌드할 시간이 있어야 한다", "There must be time to rebuild from source"], ["수동 승인이 필요해야 한다", "It must require manual approval"], ["로그가 비어 있어야 한다", "The logs must be empty"]]
  ),
  question(
    ["되돌릴 수 없는 마이그레이션이 위험한 이유는?", "Why is an irreversible migration dangerous?"],
    [["코드를 되돌려도 데이터가 이전 상태로 돌아가지 않는다", "Reverting the code does not bring the data back"], ["배포 시간이 길어지기 때문이다", "It makes deploys longer"], ["로그가 늘어나기 때문이다", "It produces more logs"], ["빌드가 실패하기 때문이다", "It breaks the build"]]
  ),
  question(
    ["데이터 손실 없이 열을 제거하려면 권장되는 절차는?", "What procedure safely removes a column without data loss?"],
    [["쓰기 중단 → 읽기 중단 → 배포 안정화 후 제거", "Stop writing, stop reading, let the deploy settle, then drop it"], ["즉시 제거하고 코드를 나중에 고친다", "Drop it now and fix the code later"], ["코드와 동시에 제거한다", "Drop it at the same moment as the code change"], ["백업 없이 제거한다", "Drop it without a backup"]]
  ),
  question(
    ["앞으로만 고치는 대응(roll forward)이 맞는 상황은?", "When is rolling forward the right call?"],
    [["되돌릴 수 없고 수정이 아주 작고 확실할 때", "When rollback is impossible and the fix is tiny and certain"], ["원인을 전혀 모를 때", "When the cause is completely unknown"], ["영향 범위가 아주 클 때", "When the blast radius is very large"], ["언제나", "Always"]]
  ),
  question(
    ["기능 플래그로 문제를 되돌리는 방식의 장점은?", "What is the advantage of undoing a problem with a feature flag?"],
    [["재배포 없이 즉시 영향을 끌 수 있다", "Impact stops immediately without a redeploy"], ["코드가 자동으로 수정된다", "The code fixes itself"], ["테스트가 필요 없어진다", "Tests become unnecessary"], ["롤백 이력을 남기지 않는다", "It leaves no trace of the rollback"]]
  ),
  question(
    ["장애 후 포스트모템의 목적은?", "What is the purpose of a post-incident review?"],
    [["책임자 지목이 아니라 재발을 막을 개선점을 찾는 것", "Finding improvements that prevent recurrence, not assigning blame"], ["담당자를 징계하는 것", "Disciplining the person responsible"], ["장애를 기록하지 않는 것", "Avoiding any record of the incident"], ["배포를 중단하는 것", "Halting all deployments"]]
  ),
  question(
    ["롤백 절차를 평소에 연습해 두는 이유는?", "Why rehearse the rollback procedure in calm times?"],
    [["실제 장애 때 망설임 없이 실행할 수 있다", "It can be executed without hesitation during a real incident"], ["배포가 빨라지기 때문이다", "It makes deploys faster"], ["테스트를 줄일 수 있어서다", "It lets you write fewer tests"], ["로그가 정리되기 때문이다", "It tidies the logs"]]
  ),
  question(
    ["배포에서 '평균 복구 시간'이 뜻하는 것은?", "What does mean time to recovery measure in deployment?"],
    [["장애 발생부터 정상 복구까지 걸린 평균 시간", "The average time from failure to restored service"], ["빌드에 걸리는 평균 시간", "The average build duration"], ["배포 횟수", "The number of deployments"], ["테스트 커버리지", "Test coverage"]]
  ),
];

const cicdQuiz: readonly (readonly QuizQuestion[])[] = [
  buildRunnerQuiz,
  testRelayQuiz,
  pipelineRelayQuiz,
  deploymentConductorQuiz,
  releaseConductorQuiz,
];

export default cicdQuiz;
