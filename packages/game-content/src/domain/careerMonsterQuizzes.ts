import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

export interface QuizConcept {
  term: LocalizedText;
  definition: LocalizedText;
}

export interface TechnologyQuizProfile {
  name: LocalizedText;
  concepts: readonly [QuizConcept, QuizConcept, QuizConcept, QuizConcept, QuizConcept];
}

const concept = (term: string, ko: string, en: string): QuizConcept => ({
  term: text(term, term),
  definition: text(ko, en),
});

export const CAREER_QUIZ_PROFILES: Readonly<Record<string, TechnologyQuizProfile>> = {
  "html-css": { name: text("HTML/CSS", "HTML/CSS"), concepts: [
    concept("Semantic HTML", "콘텐츠의 의미에 맞는 HTML 요소를 사용한다", "uses HTML elements that match the meaning of content"),
    concept("Box model", "요소를 content, padding, border, margin으로 계산한다", "calculates an element from content, padding, border and margin"),
    concept("Cascade", "우선순위와 선언 순서로 적용할 CSS 규칙을 결정한다", "chooses CSS rules by specificity and source order"),
    concept("Media query", "화면 조건에 따라 다른 CSS를 적용한다", "applies different CSS based on viewport conditions"),
    concept("Accessibility", "키보드와 보조 기술을 포함한 다양한 사용자가 이용할 수 있게 한다", "makes a page usable with keyboards and assistive technology"),
  ] },
  javascript: { name: text("JavaScript", "JavaScript"), concepts: [
    concept("Variable", "값을 이름에 연결해 재사용한다", "binds a value to a reusable name"),
    concept("Function", "입력을 받아 재사용 가능한 동작을 수행한다", "performs reusable behavior from inputs"),
    concept("Event", "클릭이나 입력처럼 발생한 동작을 코드에 알린다", "notifies code that an action such as a click occurred"),
    concept("Promise", "비동기 작업의 미래 완료 또는 실패를 나타낸다", "represents the future completion or failure of asynchronous work"),
    concept("async/await", "Promise 기반 비동기 코드를 순차적인 형태로 작성한다", "writes Promise-based asynchronous code in a sequential form"),
  ] },
  "http-api": { name: text("HTTP/API", "HTTP/API"), concepts: [
    concept("Request/Response", "클라이언트 요청과 서버 응답으로 통신한다", "communicates through a client request and server response"),
    concept("Status code", "HTTP 처리 결과를 200, 404 같은 숫자로 표현한다", "expresses an HTTP result with numbers such as 200 or 404"),
    concept("Header", "본문 외의 인증과 형식 같은 메타데이터를 전달한다", "carries metadata such as authentication and content format"),
    concept("REST endpoint", "리소스를 URL과 HTTP 메서드로 다룬다", "handles a resource through a URL and HTTP method"),
    concept("API token", "API 요청을 보낸 주체의 권한을 증명한다", "proves the caller's permission to make an API request"),
  ] },
  python: { name: text("Python", "Python"), concepts: [
    concept("Indentation", "들여쓰기로 코드 블록의 범위를 표현한다", "uses indentation to define code blocks"),
    concept("Collection", "list, tuple, dict 등으로 여러 값을 묶는다", "groups values with list, tuple, dict and similar types"),
    concept("Function/Module", "동작을 함수로 묶고 모듈로 나누어 재사용한다", "packages behavior in functions and modules for reuse"),
    concept("Exception", "예외를 발생시키고 처리해 오류 흐름을 제어한다", "raises and handles errors to control exceptional flow"),
    concept("Virtual environment", "프로젝트별 Python 패키지 의존성을 격리한다", "isolates Python package dependencies per project"),
  ] },
  sql: { name: text("SQL", "SQL"), concepts: [
    concept("SELECT/WHERE", "필요한 열과 조건에 맞는 행을 조회한다", "queries columns and rows matching a condition"),
    concept("Primary key", "테이블의 각 행을 고유하게 식별한다", "uniquely identifies each row in a table"),
    concept("JOIN", "관련 키를 기준으로 여러 테이블의 행을 결합한다", "combines rows from tables using related keys"),
    concept("Index", "추가 저장 공간을 사용해 특정 조회 속도를 높인다", "uses extra storage to speed up selected queries"),
    concept("Transaction", "여러 변경을 하나의 원자적인 작업 단위로 처리한다", "treats multiple changes as one atomic unit of work"),
  ] },
  network: { name: text("네트워크", "Networking"), concepts: [
    concept("IP address", "네트워크에서 호스트의 논리적 위치를 식별한다", "identifies a host's logical location on a network"),
    concept("DNS", "도메인 이름을 IP 주소로 변환한다", "translates a domain name into an IP address"),
    concept("TCP", "순서와 재전송을 통해 신뢰성 있는 바이트 전송을 제공한다", "provides reliable ordered byte delivery with retransmission"),
    concept("Router", "서로 다른 네트워크 사이에서 패킷의 경로를 선택한다", "chooses packet paths between different networks"),
    concept("Load balancer", "여러 서버에 요청을 분산한다", "distributes requests across multiple servers"),
  ] },
  testing: { name: text("테스팅", "Testing"), concepts: [
    concept("Unit test", "작은 코드 단위를 격리해 빠르게 검증한다", "checks a small isolated unit of code quickly"),
    concept("Assertion", "실제 결과가 기대 결과와 같은지 판정한다", "determines whether an actual result matches the expectation"),
    concept("Mock", "테스트에서 외부 의존성을 제어 가능한 대역으로 바꾼다", "replaces an external dependency with a controllable test double"),
    concept("Integration test", "여러 구성 요소가 함께 동작하는지 검증한다", "checks that multiple components work together"),
    concept("Regression test", "기존 기능이 변경 후 다시 깨지지 않았는지 확인한다", "checks that existing behavior did not break after a change"),
  ] },
  "security-auth": { name: text("보안/인증", "Security/Auth"), concepts: [
    concept("Hash", "비밀번호를 복원 가능한 평문 대신 단방향 값으로 저장한다", "stores passwords as one-way values instead of recoverable plaintext"),
    concept("Authentication", "사용자가 누구인지 확인한다", "verifies who a user is"),
    concept("Authorization", "확인된 사용자가 무엇을 할 수 있는지 결정한다", "decides what an authenticated user may do"),
    concept("Input validation", "외부 입력을 규칙에 따라 검사하고 제한한다", "checks and constrains external input according to rules"),
    concept("Least privilege", "작업에 필요한 최소 권한만 부여한다", "grants only the minimum permissions needed for a task"),
  ] },
  docker: { name: text("Docker", "Docker"), concepts: [
    concept("Image", "컨테이너 실행에 필요한 읽기 전용 템플릿이다", "is a read-only template needed to run a container"),
    concept("Container", "이미지를 격리된 프로세스로 실행한 인스턴스다", "is a running isolated process created from an image"),
    concept("Dockerfile", "이미지를 만드는 명령을 선언적으로 기록한다", "declares the instructions used to build an image"),
    concept("Volume", "컨테이너 수명과 분리해 데이터를 보존한다", "persists data independently of a container's lifetime"),
    concept("Registry", "컨테이너 이미지를 저장하고 배포한다", "stores and distributes container images"),
  ] },
  cicd: { name: text("CI/CD", "CI/CD"), concepts: [
    concept("Build", "소스 코드를 실행 가능한 산출물로 만든다", "turns source code into a runnable artifact"),
    concept("Automated test", "변경마다 테스트를 자동 실행해 결함을 빠르게 찾는다", "runs tests on changes to find defects quickly"),
    concept("Pipeline", "빌드, 테스트, 배포 단계를 자동화된 흐름으로 연결한다", "connects build, test and deploy stages in an automated flow"),
    concept("Deployment", "검증된 산출물을 실행 환경에 반영한다", "releases a verified artifact into a runtime environment"),
    concept("Rollback", "문제가 생긴 배포를 이전 안정 버전으로 되돌린다", "returns a faulty release to a previous stable version"),
  ] },
  kubernetes: { name: text("Kubernetes", "Kubernetes"), concepts: [
    concept("Pod", "하나 이상의 컨테이너가 함께 실행되는 최소 배포 단위다", "is the smallest deployable unit containing one or more containers"),
    concept("Deployment", "Pod 복제본과 롤링 업데이트 상태를 관리한다", "manages Pod replicas and rolling updates"),
    concept("Service", "변하는 Pod 집합에 안정적인 네트워크 접근점을 제공한다", "provides a stable network endpoint for a changing set of Pods"),
    concept("ConfigMap/Secret", "설정과 민감 정보를 컨테이너 이미지 밖에서 주입한다", "injects configuration and sensitive data outside the container image"),
    concept("Autoscaling", "부하나 지표에 따라 실행 복제본 수를 조절한다", "adjusts the number of replicas based on load or metrics"),
  ] },
  "cloud-iac": { name: text("Cloud/IaC", "Cloud/IaC"), concepts: [
    concept("Resource", "클라우드에서 관리하는 서버, 네트워크 같은 구성 요소다", "is a managed cloud component such as a server or network"),
    concept("State", "선언한 구성과 실제 인프라의 대응 관계를 기록한다", "records the mapping between declared configuration and real infrastructure"),
    concept("Plan", "적용 전에 인프라 변경 예정 사항을 보여준다", "shows intended infrastructure changes before applying them"),
    concept("Module", "반복되는 인프라 구성을 재사용 가능한 단위로 묶는다", "packages repeated infrastructure configuration for reuse"),
    concept("Immutable infrastructure", "운영 서버를 직접 고치기보다 새 이미지로 교체한다", "replaces servers with new images instead of editing them in place"),
  ] },
  monitoring: { name: text("모니터링", "Monitoring"), concepts: [
    concept("Metric", "시간에 따라 변하는 수치 상태를 측정한다", "measures numeric state changing over time"),
    concept("Log", "시스템에서 발생한 사건을 개별 기록으로 남긴다", "records individual events produced by a system"),
    concept("Trace", "분산 시스템에서 하나의 요청이 거친 경로를 추적한다", "follows one request across a distributed system"),
    concept("Alert", "관찰 값이 정한 조건을 넘으면 담당자에게 알린다", "notifies responders when an observed value crosses a condition"),
    concept("SLI/SLO", "서비스 신뢰성 지표와 그 목표 수준을 정의한다", "defines a reliability indicator and its target level"),
  ] },
  react: { name: text("React", "React"), concepts: [
    concept("Component", "UI를 독립적이고 재사용 가능한 단위로 나눈다", "splits UI into independent reusable units"),
    concept("Props", "부모가 자식 컴포넌트에 읽기 전용 값을 전달한다", "passes read-only values from a parent to a child component"),
    concept("State", "컴포넌트가 기억하며 변경 시 다시 렌더링되는 값이다", "is remembered component data that triggers rendering when changed"),
    concept("Hook", "함수 컴포넌트에서 상태와 생명주기 기능을 사용한다", "uses state and lifecycle features in function components"),
    concept("Key", "목록 항목의 정체성을 React가 안정적으로 추적하게 한다", "lets React track the identity of list items reliably"),
  ] },
  "server-framework": { name: text("서버 프레임워크", "Server framework"), concepts: [
    concept("Route", "HTTP 메서드와 URL을 처리 코드에 연결한다", "maps an HTTP method and URL to handler code"),
    concept("Middleware", "요청과 응답 사이의 공통 처리를 수행한다", "runs shared processing in the request-response chain"),
    concept("Controller", "요청을 해석하고 적절한 서비스 호출과 응답을 조정한다", "coordinates request parsing, service calls and responses"),
    concept("Service layer", "업무 규칙을 HTTP 표현과 분리해 담는다", "holds business rules separately from HTTP representation"),
    concept("Dependency injection", "객체가 의존성을 직접 만들지 않고 외부에서 전달받는다", "supplies dependencies from outside instead of constructing them internally"),
  ] },
  "data-pipeline": { name: text("데이터 파이프라인", "Data pipelines"), concepts: [
    concept("Extract", "원천 시스템에서 데이터를 읽어 온다", "reads data from source systems"),
    concept("Transform", "데이터를 정제하고 분석 가능한 형태로 바꾼다", "cleans and reshapes data into an analyzable form"),
    concept("Load", "처리한 데이터를 목적 저장소에 적재한다", "writes processed data into a destination store"),
    concept("Batch/Stream", "데이터를 묶음 또는 연속 이벤트 흐름으로 처리한다", "processes data as grouped batches or a continuous event stream"),
    concept("Data quality", "정확성, 완전성, 유효성 규칙으로 데이터를 검증한다", "validates data with accuracy, completeness and validity rules"),
  ] },
  orchestration: { name: text("워크플로 오케스트레이션", "Workflow orchestration"), concepts: [
    concept("DAG", "순환 없이 작업 의존 관계를 방향 그래프로 표현한다", "represents task dependencies as a directed acyclic graph"),
    concept("Task", "워크플로에서 실행하고 추적하는 최소 작업 단위다", "is the smallest executed and tracked unit in a workflow"),
    concept("Dependency", "한 작업이 다른 작업보다 먼저 끝나야 하는 관계다", "requires one task to finish before another can run"),
    concept("Schedule", "워크플로가 실행될 시간이나 주기를 정한다", "defines when or how often a workflow runs"),
    concept("Retry", "일시적 실패가 발생한 작업을 정책에 따라 다시 실행한다", "reruns a temporarily failed task according to policy"),
  ] },
  statistics: { name: text("기초 통계", "Basic statistics"), concepts: [
    concept("Sample", "전체 모집단을 이해하기 위해 선택한 일부 관측값이다", "is a subset of observations selected to understand a population"),
    concept("Probability", "사건이 일어날 가능성을 0과 1 사이로 나타낸다", "expresses event likelihood between zero and one"),
    concept("Distribution", "가능한 값과 그 확률의 패턴을 설명한다", "describes possible values and their probability pattern"),
    concept("Variance", "값들이 평균에서 얼마나 퍼져 있는지 측정한다", "measures how far values spread from their mean"),
    concept("Inference", "표본을 사용해 모집단에 관한 결론을 추정한다", "uses a sample to estimate conclusions about a population"),
  ] },
  visualization: { name: text("데이터 시각화", "Data visualization"), concepts: [
    concept("Chart selection", "비교, 추세, 분포 등 분석 목적에 맞는 차트를 고른다", "chooses a chart suited to comparison, trend or distribution"),
    concept("Scale", "값을 시각적 위치나 길이에 일관되게 대응시킨다", "maps values consistently to visual position or length"),
    concept("Color", "강조와 범주 구분을 위해 제한적이고 일관되게 사용한다", "is used consistently and sparingly for emphasis and categories"),
    concept("Annotation", "중요한 값이나 사건에 직접 설명을 덧붙인다", "adds direct explanation to an important value or event"),
    concept("Visual story", "핵심 질문에서 근거와 결론으로 시선 흐름을 설계한다", "guides attention from a key question through evidence to a conclusion"),
  ] },
  "bi-tools": { name: text("BI 도구", "BI tools"), concepts: [
    concept("Metric", "비즈니스 성과를 일관된 계산식으로 측정한다", "measures business performance with a consistent calculation"),
    concept("Dimension", "지역, 제품, 시간처럼 지표를 나누어 보는 기준이다", "is a category such as region, product or time used to slice a metric"),
    concept("Semantic model", "데이터 관계와 공통 비즈니스 정의를 한곳에 관리한다", "centralizes data relationships and shared business definitions"),
    concept("Filter/Drill", "관심 범위를 좁히거나 더 상세한 수준으로 탐색한다", "narrows scope or explores a more detailed level"),
    concept("Dashboard governance", "지표 소유권과 갱신 주기, 접근 권한을 관리한다", "manages metric ownership, refresh cadence and access"),
  ] },
};

const pickOther = <T>(items: readonly T[], focus: number, offset: number): T[] =>
  [1, 2, 3].map((step) => items[(focus + step + offset) % items.length]);

export function buildCareerMonsterQuiz(
  technologyId: string,
  levelIndex: number,
  monsterName: string
): readonly QuizQuestion[] {
  const profile = CAREER_QUIZ_PROFILES[technologyId];
  if (!profile) return [];
  const focus = profile.concepts[levelIndex % profile.concepts.length];
  const otherTerms = pickOther(profile.concepts, levelIndex, 0).map((item) => item.term);
  const termChoices = [focus.term, ...otherTerms];
  const technology = profile.name;

  const prompts = [
    text(`다음 설명에 맞는 ${technology.ko} 개념은?\n${focus.definition.ko}`, `Which ${technology.en} concept matches this description?\n${focus.definition.en}`),
    text(`다음 의미를 가진 용어는?\n${focus.definition.ko}`, `Which term has this meaning?\n${focus.definition.en}`),
    text(`${monsterName}이 지키는 핵심 개념을 고르세요.\n${focus.definition.ko}`, `Choose the core concept guarded by ${monsterName}.\n${focus.definition.en}`),
    text(`다음 실무 역할을 담당하는 개념은?\n${focus.definition.ko}`, `Which concept performs this practical role?\n${focus.definition.en}`),
    text(`${technology.ko} 학습 중 다음 역할을 담당하는 것은?\n${focus.definition.ko}`, `During ${technology.en} work, what has this role?\n${focus.definition.en}`),
    text(`다음 설명에서 강조하는 핵심 용어는?\n${focus.definition.ko}`, `Which key term is emphasized here?\n${focus.definition.en}`),
    text(`LV.${levelIndex + 1} 체크포인트의 설명과 연결되는 용어는?`, `Which term matches the LV.${levelIndex + 1} checkpoint description?`),
    text(`${technology.ko} 코드 리뷰에서 다음 설명과 연결할 용어는?\n${focus.definition.ko}`, `Which ${technology.en} term belongs with this review note?\n${focus.definition.en}`),
  ];

  return prompts.map((prompt) => ({
    prompt,
    choices: termChoices,
    answerIndex: 0,
  }));
}

export function careerQuizProfile(technologyId: string): TechnologyQuizProfile {
  const profile = CAREER_QUIZ_PROFILES[technologyId];
  if (!profile) throw new Error(`Missing career quiz profile: ${technologyId}`);
  return profile;
}
