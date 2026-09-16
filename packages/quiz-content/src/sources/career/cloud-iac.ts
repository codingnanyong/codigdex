import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 resource-cloud — Resource */
const resourceCloudQuiz: readonly QuizQuestion[] = [
  question(
    ["클라우드 리소스를 가장 잘 설명한 것은?", "Which best describes a cloud resource?"],
    [["클라우드가 관리하는 서버, 네트워크 같은 구성 요소", "A managed cloud component such as a server or a network"], ["소스 코드 파일", "A source code file"], ["빌드 스크립트", "A build script"], ["로그 한 줄", "A single log line"]]
  ),
  question(
    ["코드로 인프라를 정의하는 방식을 부르는 말은?", "What is defining infrastructure with code called?"],
    ["IaC", "CI", "CDN", "SLA"]
  ),
  question(
    ["인프라를 코드로 관리할 때의 가장 큰 이점은?", "What is the biggest benefit of managing infrastructure as code?"],
    [["변경 이력이 남고 리뷰와 재현이 가능하다", "Changes are versioned, reviewable and reproducible"], ["비용이 항상 0이 된다", "Cost always drops to zero"], ["장애가 사라진다", "Outages stop happening"], ["모니터링이 필요 없어진다", "Monitoring becomes unnecessary"]]
  ),
  question(
    ["콘솔에서 손으로 자원을 만드는 방식의 문제는?", "What is wrong with creating resources by hand in a console?"],
    [["무엇이 왜 만들어졌는지 기록이 남지 않아 재현이 어렵다", "Nothing records what was made or why, so it cannot be reproduced"], ["항상 더 느리다", "It is always slower"], ["비용이 두 배가 된다", "It doubles the cost"], ["보안 그룹을 만들 수 없다", "Security groups cannot be created"]]
  ),
  question(
    ["여러 자원을 논리적으로 묶어 함께 관리하는 단위는?", "Which unit groups related resources so they are managed together?"],
    [["리소스 그룹 또는 스택", "A resource group or stack"], ["가용 영역", "An availability zone"], ["인스턴스 유형", "An instance type"], ["보안 그룹", "A security group"]]
  ),
  question(
    ["같은 리전 안에서 물리적으로 분리된 구역을 부르는 말은?", "What is a physically separated area inside one region called?"],
    [["가용 영역", "An availability zone"], ["리전", "A region"], ["엣지 로케이션", "An edge location"], ["서브넷 마스크", "A subnet mask"]]
  ),
  question(
    ["서비스를 여러 가용 영역에 나눠 두는 이유는?", "Why spread a service across multiple availability zones?"],
    [["한 영역에 장애가 나도 서비스가 계속된다", "The service survives the failure of one zone"], ["비용이 줄어든다", "It reduces cost"], ["지연이 항상 낮아진다", "Latency always drops"], ["배포가 빨라진다", "Deployments get faster"]]
  ),
  question(
    ["자원에 태그를 붙이는 주된 이유는?", "Why tag cloud resources?"],
    [["소유자와 용도를 식별해 비용과 권한을 관리한다", "It identifies owner and purpose for cost and access management"], ["성능이 좋아진다", "It improves performance"], ["자원이 자동 삭제된다", "Resources are deleted automatically"], ["네트워크가 빨라진다", "The network gets faster"]]
  ),
  question(
    ["쓰지 않는 자원을 방치하면 생기는 문제는?", "What is the cost of leaving unused resources around?"],
    [["요금이 계속 나가고 공격 표면이 넓어진다", "Charges keep accruing and the attack surface grows"], ["아무 문제가 없다", "Nothing at all"], ["자원이 자동 정리된다", "They are cleaned up automatically"], ["성능이 좋아진다", "Performance improves"]]
  ),
  question(
    ["클라우드 비용을 예측 가능하게 만드는 기본 조치는?", "What basic step makes cloud spend predictable?"],
    [["예산과 알림을 설정하고 태그별로 비용을 본다", "Set budgets and alerts, and review cost by tag"], ["가장 큰 인스턴스를 쓴다", "Always use the largest instance"], ["로그를 끈다", "Turn logging off"], ["리전을 매달 바꾼다", "Change region every month"]]
  ),
];

/** LV.2 plan-builder — State */
const planBuilderQuiz: readonly QuizQuestion[] = [
  question(
    ["IaC의 상태 파일이 기록하는 것은?", "What does an IaC state file record?"],
    [["선언한 구성과 실제 인프라의 대응 관계", "The mapping between declared configuration and real infrastructure"], ["소스 코드의 변경 이력", "The source code history"], ["사용자 로그인 기록", "User login history"], ["빌드 로그", "Build logs"]]
  ),
  question(
    ["상태 파일이 없으면 생기는 문제는?", "What goes wrong without a state file?"],
    [["이미 만든 자원을 알아보지 못해 중복 생성한다", "Existing resources go unrecognized and get created again"], ["설정 파일을 읽지 못한다", "The configuration cannot be read"], ["문법 검사가 실패한다", "Syntax checking fails"], ["비용이 계산되지 않는다", "Cost cannot be calculated"]]
  ),
  question(
    ["여러 사람이 같이 작업할 때 상태 파일을 두어야 할 곳은?", "Where should the state file live when several people collaborate?"],
    [["잠금을 지원하는 원격 백엔드", "A remote backend that supports locking"], ["각자의 노트북", "Each person's laptop"], ["이메일 첨부", "An email attachment"], ["채팅 메시지", "A chat message"]]
  ),
  question(
    ["상태 잠금(state locking)이 막아 주는 것은?", "What does state locking prevent?"],
    [["두 사람이 동시에 적용해 상태가 깨지는 일", "Two people applying at once and corrupting the state"], ["설정 파일의 문법 오류", "Syntax errors in the configuration"], ["비용 초과", "Budget overruns"], ["네트워크 지연", "Network latency"]]
  ),
  question(
    ["상태 파일을 Git에 그대로 커밋하면 안 되는 이유는?", "Why should a state file not be committed to Git as-is?"],
    [["비밀 값이 담길 수 있고 동시 수정에 취약하다", "It can contain secrets and handles concurrent edits badly"], ["파일 형식이 지원되지 않는다", "The file format is unsupported"], ["용량이 항상 크다", "It is always enormous"], ["Git이 JSON을 읽지 못한다", "Git cannot read JSON"]]
  ),
  question(
    ["콘솔에서 손으로 자원을 고쳤을 때 생기는 상태 불일치를 부르는 말은?", "What is the mismatch called when someone edits a resource by hand?"],
    [["드리프트", "Drift"], ["롤백", "Rollback"], ["샤딩", "Sharding"], ["마이그레이션", "Migration"]]
  ),
  question(
    ["드리프트를 발견했을 때 바람직한 대응은?", "What is the right response to detected drift?"],
    [["코드를 실제 상태에 맞추거나 코드대로 되돌린다", "Reconcile the code to reality, or restore reality to the code"], ["상태 파일을 삭제한다", "Delete the state file"], ["무시하고 계속 적용한다", "Ignore it and keep applying"], ["자원을 모두 다시 만든다", "Recreate every resource"]]
  ),
  question(
    ["이미 존재하는 자원을 IaC 관리 아래로 가져오는 작업은?", "What is bringing an existing resource under IaC management called?"],
    [["임포트", "An import"], ["플랜", "A plan"], ["디스트로이", "A destroy"], ["프로비저닝", "Provisioning"]]
  ),
  question(
    ["환경별로 상태를 분리해 두는 이유는?", "Why keep state separate per environment?"],
    [["개발 작업이 운영 인프라를 건드리지 않게 한다", "It keeps development work from touching production infrastructure"], ["파일 크기를 줄인다", "It reduces file size"], ["문법이 간단해진다", "It simplifies the syntax"], ["비용이 사라진다", "It removes the cost"]]
  ),
  question(
    ["상태 파일에 접근 권한을 엄격히 제한해야 하는 이유는?", "Why restrict access to the state file tightly?"],
    [["인프라 구조와 비밀 값이 담겨 있다", "It exposes the infrastructure layout and any secrets inside"], ["용량이 크기 때문이다", "Because it is large"], ["자주 바뀌기 때문이다", "Because it changes often"], ["읽기 전용이기 때문이다", "Because it is read-only"]]
  ),
];

/** LV.3 blueprint-builder — Plan */
const blueprintBuilderQuiz: readonly QuizQuestion[] = [
  question(
    ["플랜(plan) 단계가 보여 주는 것은?", "What does a plan step show?"],
    [["적용 전에 무엇이 생성·변경·삭제될지", "What will be created, changed and destroyed before anything is applied"], ["이미 적용된 결과", "What has already been applied"], ["비용 청구서", "The billing invoice"], ["로그 기록", "The log history"]]
  ),
  question(
    ["플랜을 반드시 검토해야 하는 이유는?", "Why must a plan always be reviewed?"],
    [["의도하지 않은 삭제나 재생성을 미리 발견한다", "It surfaces unintended deletions and replacements in advance"], ["적용 속도가 빨라진다", "It makes the apply faster"], ["비용이 줄어든다", "It reduces cost"], ["상태 파일이 작아진다", "It shrinks the state file"]]
  ),
  question(
    ["플랜에 '자원 교체(replace)'가 뜬다는 것은?", "What does a plan showing a replacement mean?"],
    [["기존 자원을 지우고 새로 만든다는 뜻이다", "The existing resource will be destroyed and recreated"], ["설정만 살짝 바뀐다는 뜻이다", "Only a setting will change in place"], ["아무 일도 없다는 뜻이다", "Nothing will happen"], ["상태 파일만 갱신된다는 뜻이다", "Only the state file will update"]]
  ),
  question(
    ["데이터베이스에 교체 계획이 떴을 때 먼저 할 일은?", "What should you do first when a database shows as being replaced?"],
    [["왜 교체되는지 확인하고 데이터 보존 방법을 마련한다", "Find out why, and arrange for the data to survive"], ["그대로 적용한다", "Apply it as-is"], ["상태 파일을 지운다", "Delete the state file"], ["플랜을 건너뛴다", "Skip the plan"]]
  ),
  question(
    ["CI에서 PR마다 플랜을 실행해 코멘트로 남기면 좋은 점은?", "What is gained by running a plan on every PR and posting it as a comment?"],
    [["머지 전에 인프라 변경 영향을 함께 리뷰할 수 있다", "The infrastructure impact is reviewed together before merge"], ["적용이 자동으로 승인된다", "The apply is approved automatically"], ["상태가 잠긴다", "The state gets locked"], ["비용이 사라진다", "Cost disappears"]]
  ),
  question(
    ["플랜 결과를 파일로 저장해 그대로 적용하는 이유는?", "Why save a plan to a file and apply exactly that file?"],
    [["리뷰한 내용과 실제 적용이 어긋나지 않게 한다", "It guarantees what was reviewed is what gets applied"], ["실행 속도가 빨라진다", "It runs faster"], ["상태가 필요 없어진다", "State becomes unnecessary"], ["문법 검사를 건너뛴다", "It skips syntax checking"]]
  ),
  question(
    ["적용 전에 구성의 문법과 형식을 확인하는 단계는?", "Which step checks configuration syntax and formatting before applying?"],
    [["검증과 포맷 검사", "Validate and format checks"], ["임포트", "Import"], ["디스트로이", "Destroy"], ["리프레시", "Refresh"]]
  ),
  question(
    ["플랜에 예상치 못한 대량 변경이 떴을 때 의심할 것은?", "What should you suspect when a plan shows unexpected mass changes?"],
    [["다른 상태 파일을 보고 있거나 공급자 버전이 바뀌었다", "You are pointing at a different state, or the provider version changed"], ["네트워크가 느리다", "The network is slow"], ["로그가 부족하다", "There are too few logs"], ["태그가 없다", "Tags are missing"]]
  ),
  question(
    ["운영 환경 적용 전에 두어야 할 장치는?", "What safeguard belongs before a production apply?"],
    [["플랜 검토와 수동 승인", "Plan review with a manual approval"], ["자동 즉시 적용", "Immediate automatic apply"], ["상태 파일 삭제", "Deleting the state file"], ["태그 제거", "Removing tags"]]
  ),
  question(
    ["공급자와 모듈 버전을 고정하는 이유는?", "Why pin provider and module versions?"],
    [["같은 코드가 언제 적용해도 같은 결과를 내게 한다", "The same code yields the same result whenever it is applied"], ["플랜을 생략할 수 있다", "It lets you skip the plan"], ["비용이 줄어든다", "It reduces cost"], ["상태가 필요 없어진다", "It removes the need for state"]]
  ),
];

/** LV.4 infrastructure-architect — Module */
const infrastructureArchitectQuiz: readonly QuizQuestion[] = [
  question(
    ["모듈이 하는 일은?", "What does a module do?"],
    [["반복되는 인프라 구성을 재사용 가능한 단위로 묶는다", "It packages repeated infrastructure configuration for reuse"], ["상태를 저장한다", "It stores the state"], ["비용을 계산한다", "It calculates cost"], ["로그를 수집한다", "It collects logs"]]
  ),
  question(
    ["같은 구성을 여러 환경에 쓸 때 모듈을 쓰면 좋은 점은?", "What does a module give you across several environments?"],
    [["복사 붙여넣기 없이 변수만 바꿔 재사용한다", "You reuse it by changing variables instead of copying and pasting"], ["상태 파일이 필요 없어진다", "State files become unnecessary"], ["플랜이 생략된다", "The plan step is skipped"], ["비용이 절반이 된다", "Cost is halved"]]
  ),
  question(
    ["모듈에 값을 전달하는 통로는?", "How do you pass values into a module?"],
    [["입력 변수", "Input variables"], ["상태 파일", "The state file"], ["로그 파일", "A log file"], ["태그", "Tags"]]
  ),
  question(
    ["모듈이 만든 값을 바깥에 노출하는 통로는?", "How does a module expose values to its caller?"],
    [["출력 값", "Output values"], ["입력 변수", "Input variables"], ["공급자 설정", "Provider settings"], ["백엔드 설정", "Backend settings"]]
  ),
  question(
    ["모듈을 설계할 때 바람직한 크기는?", "What is a healthy size for a module?"],
    [["하나의 목적을 완결하는 작고 응집된 단위", "Small and cohesive, completing one purpose"], ["전체 인프라를 하나로 담는 큰 단위", "One giant module holding all the infrastructure"], ["자원 하나마다 하나씩", "Exactly one per individual resource"], ["크기는 상관없다", "Size does not matter"]]
  ),
  question(
    ["공용 모듈을 버전 없이 참조하면?", "What happens when a shared module is referenced without a version?"],
    [["상대가 바뀌면 내 인프라가 예고 없이 달라진다", "Someone else's change alters your infrastructure without warning"], ["플랜이 더 빨라진다", "The plan runs faster"], ["상태가 잠긴다", "The state gets locked"], ["아무 문제가 없다", "Nothing is affected"]]
  ),
  question(
    ["환경마다 다른 값을 관리하는 좋은 방법은?", "What is a good way to manage per-environment values?"],
    [["환경별 변수 파일로 분리한다", "Keep them in separate per-environment variable files"], ["코드에 하드코딩한다", "Hardcode them in the code"], ["콘솔에서 직접 고친다", "Edit them in the console"], ["모듈을 복사한다", "Copy the whole module"]]
  ),
  question(
    ["모듈 안에 비밀 값을 기본값으로 넣으면?", "What if a secret is set as a default inside a module?"],
    [["저장소에 노출되고 모든 사용자가 같은 값을 쓰게 된다", "It leaks into the repository and every consumer shares one value"], ["자동으로 암호화된다", "It is encrypted automatically"], ["플랜에서 숨겨진다", "It is hidden from the plan"], ["문제가 되지 않는다", "It is not a problem"]]
  ),
  question(
    ["모듈 변경이 사용하는 쪽을 깨뜨리지 않게 하려면?", "How do you keep a module change from breaking its consumers?"],
    [["호환되지 않는 변경은 메이저 버전을 올려 알린다", "Signal incompatible changes with a major version bump"], ["조용히 배포한다", "Ship it quietly"], ["변수 이름을 자유롭게 바꾼다", "Rename variables freely"], ["출력 값을 제거한다", "Remove the outputs"]]
  ),
  question(
    ["잘 만든 모듈에 함께 있어야 할 것은?", "What belongs alongside a well-made module?"],
    [["입력·출력 설명과 사용 예시", "Documented inputs, outputs and a usage example"], ["운영 상태 파일", "The production state file"], ["실제 비밀 값", "Real secret values"], ["콘솔 스크린숏만", "Console screenshots only"]]
  ),
];

/** LV.5 infrastructure-titan — Immutable infrastructure */
const infrastructureTitanQuiz: readonly QuizQuestion[] = [
  question(
    ["불변 인프라의 핵심 원칙은?", "What is the core principle of immutable infrastructure?"],
    [["운영 서버를 고치지 않고 새 이미지로 교체한다", "Servers are replaced with new images rather than edited in place"], ["서버에 접속해 계속 수정한다", "Servers are logged into and patched continuously"], ["자원을 절대 삭제하지 않는다", "Resources are never deleted"], ["상태를 저장하지 않는다", "No state is ever stored"]]
  ),
  question(
    ["운영 서버를 손으로 고치면 생기는 문제를 부르는 말은?", "What is the problem called when production servers are hand-patched over time?"],
    [["스노플레이크 서버", "Snowflake servers"], ["블루-그린", "Blue-green"], ["멱등성", "Idempotence"], ["오토스케일링", "Autoscaling"]]
  ),
  question(
    ["불변 인프라가 주는 가장 큰 이점은?", "What is the biggest benefit of immutable infrastructure?"],
    [["모든 서버가 같은 상태라 재현과 롤백이 쉽다", "Every server is identical, so reproducing and rolling back is easy"], ["비용이 항상 줄어든다", "Cost always goes down"], ["모니터링이 필요 없어진다", "Monitoring becomes unnecessary"], ["배포가 필요 없어진다", "Deployment becomes unnecessary"]]
  ),
  question(
    ["여러 번 적용해도 결과가 같아야 하는 성질은?", "What property requires the same result no matter how often it is applied?"],
    [["멱등성", "Idempotence"], ["가변성", "Mutability"], ["휘발성", "Volatility"], ["탄력성", "Elasticity"]]
  ),
  question(
    ["불변 인프라에서 서버 상태를 어디에 두어야 하나?", "Where must state live under immutable infrastructure?"],
    [["서버 밖의 저장소나 관리형 서비스", "Outside the server, in a store or managed service"], ["각 서버의 로컬 디스크", "On each server's local disk"], ["실행 중인 프로세스 메모리", "In the running process's memory"], ["설정 파일 주석", "In configuration file comments"]]
  ),
  question(
    ["보안 패치를 불변 인프라 방식으로 적용하려면?", "How do you apply a security patch the immutable way?"],
    [["패치된 이미지를 새로 빌드해 교체 배포한다", "Build a new patched image and roll it out as a replacement"], ["모든 서버에 접속해 업데이트한다", "Log into every server and update it"], ["다음 배포까지 기다린다", "Wait until some later deploy"], ["패치를 건너뛴다", "Skip the patch"]]
  ),
  question(
    ["재해 복구 계획에서 가장 중요한 확인은?", "What matters most in a disaster recovery plan?"],
    [["복구 절차를 실제로 연습해 복구 시간을 검증하는 것", "Actually rehearsing the procedure and measuring recovery time"], ["문서를 길게 쓰는 것", "Writing a longer document"], ["백업 용량을 늘리는 것", "Adding more backup storage"], ["알림을 늘리는 것", "Adding more alerts"]]
  ),
  question(
    ["백업이 있다는 사실만으로 충분하지 않은 이유는?", "Why is having backups not enough on its own?"],
    [["복원을 시험해 보지 않으면 실제로 쓸 수 있는지 모른다", "Untested restores may not actually work when needed"], ["백업은 항상 손상되기 때문이다", "Backups are always corrupted"], ["백업은 비용이 들기 때문이다", "Backups cost money"], ["백업은 자동화할 수 없기 때문이다", "Backups cannot be automated"]]
  ),
  question(
    ["의도적으로 장애를 주입해 복원력을 검증하는 방식은?", "Which practice injects failures on purpose to verify resilience?"],
    [["카오스 엔지니어링", "Chaos engineering"], ["린트 검사", "Lint checking"], ["코드 리뷰", "Code review"], ["부하 분산", "Load balancing"]]
  ),
  question(
    ["인프라 변경을 안전하게 운영하기 위해 필요한 조합은?", "Which combination keeps infrastructure changes safe in practice?"],
    [["코드화된 구성, 플랜 검토, 되돌릴 수 있는 배포", "Configuration as code, plan review and reversible rollout"], ["콘솔 수작업과 즉시 적용", "Console edits applied immediately"], ["권한 없는 전면 접근", "Unrestricted access for everyone"], ["기록 없는 긴급 변경", "Undocumented emergency changes"]]
  ),
];

const cloudIacQuiz: readonly (readonly QuizQuestion[])[] = [
  resourceCloudQuiz,
  planBuilderQuiz,
  blueprintBuilderQuiz,
  infrastructureArchitectQuiz,
  infrastructureTitanQuiz,
];

export default cloudIacQuiz;
