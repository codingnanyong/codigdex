import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 route-scout — Route */
const routeScoutQuiz: readonly QuizQuestion[] = [
  question(
    ["라우트가 하는 일은?", "What does a route do?"],
    [["HTTP 메서드와 URL을 처리 코드에 연결한다", "It maps an HTTP method and URL to handler code"], ["데이터베이스를 연결한다", "It connects to the database"], ["HTML을 생성한다", "It generates HTML"], ["로그를 저장한다", "It stores logs"]]
  ),
  question(
    ["URL 경로에서 값을 받아오는 부분을 부르는 말은?", "What is a variable segment of a URL path called?"],
    [["경로 매개변수", "A path parameter"], ["쿼리 문자열", "The query string"], ["요청 헤더", "A request header"], ["요청 본문", "The request body"]]
  ),
  question(
    ["/users/:id 형태의 라우트가 처리하는 요청은?", "Which request does a route like /users/:id handle?"],
    ["GET /users/42", "GET /users?id=42", "POST /users/all", "GET /user"]
  ),
  question(
    ["검색 조건처럼 선택적인 값을 전달하기 좋은 곳은?", "Where do optional values such as search filters belong?"],
    [["쿼리 문자열", "The query string"], ["경로 매개변수", "A path parameter"], ["응답 헤더", "A response header"], ["상태 코드", "The status code"]]
  ),
  question(
    ["라우트를 등록할 때 순서가 중요한 이유는?", "Why does route registration order matter?"],
    [["더 넓은 패턴이 먼저 등록되면 구체적인 라우트를 가로챈다", "A broad pattern registered first can swallow a more specific route"], ["순서는 전혀 상관없다", "Order never matters"], ["알파벳 순으로 실행되기 때문이다", "They run alphabetically"], ["메서드마다 순서가 다르기 때문이다", "Each method uses a different order"]]
  ),
  question(
    ["같은 경로에 GET과 POST를 따로 정의하는 이유는?", "Why define GET and POST separately on the same path?"],
    [["메서드마다 다른 의미와 처리가 필요하기 때문이다", "Each method carries a different meaning and needs different handling"], ["프레임워크가 강제하기 때문이다", "The framework requires it"], ["성능을 위해서다", "For performance"], ["보안 때문에 불가피하다", "It is unavoidable for security"]]
  ),
  question(
    ["여러 라우트에 공통 접두사를 붙여 묶는 기능은?", "Which feature groups routes under a shared prefix?"],
    [["라우터 그룹 또는 마운트", "A router group or mount point"], ["미들웨어 체인", "A middleware chain"], ["의존성 주입", "Dependency injection"], ["서비스 레이어", "The service layer"]]
  ),
  question(
    ["요청 본문을 객체로 읽으려면 필요한 것은?", "What is needed to read a request body as an object?"],
    [["본문 파서가 등록돼 있어야 한다", "A body parser must be registered"], ["라우트 이름을 바꿔야 한다", "The route must be renamed"], ["쿼리 문자열이 있어야 한다", "A query string must be present"], ["응답을 먼저 보내야 한다", "The response must be sent first"]]
  ),
  question(
    ["정의되지 않은 경로로 요청이 왔을 때 반환할 상태 코드는?", "Which status code fits a request to an undefined path?"],
    ["404", "500", "400", "302"]
  ),
  question(
    ["라우트 핸들러가 얇게 유지되어야 하는 이유는?", "Why should a route handler stay thin?"],
    [["업무 규칙을 따로 두어야 테스트와 재사용이 쉽다", "Keeping business rules elsewhere makes them testable and reusable"], ["코드 줄 수를 줄이기 위해서다", "Just to reduce line count"], ["프레임워크가 제한하기 때문이다", "The framework limits it"], ["성능 때문에 필수다", "It is required for performance"]]
  ),
];

/** LV.2 middleware-pair — Middleware */
const middlewarePairQuiz: readonly QuizQuestion[] = [
  question(
    ["미들웨어가 하는 일은?", "What does middleware do?"],
    [["요청과 응답 사이의 공통 처리를 수행한다", "It runs shared processing in the request-response chain"], ["데이터베이스 스키마를 정의한다", "It defines the database schema"], ["HTML을 렌더링한다", "It renders HTML"], ["서버를 빌드한다", "It builds the server"]]
  ),
  question(
    ["다음 미들웨어로 제어를 넘기지 않으면?", "What happens if control is never passed to the next middleware?"],
    [["요청이 응답 없이 멈춘다", "The request hangs with no response"], ["자동으로 다음으로 넘어간다", "It moves on automatically"], ["오류가 발생한다", "An error is thrown"], ["라우트가 두 번 실행된다", "The route runs twice"]]
  ),
  question(
    ["미들웨어로 처리하기에 적합한 것은?", "Which task suits middleware?"],
    [["인증, 로깅, 요청 파싱 같은 공통 관심사", "Cross-cutting concerns such as authentication, logging and parsing"], ["특정 화면의 계산 로직", "One screen's specific calculation"], ["데이터베이스 마이그레이션", "Database migrations"], ["빌드 스크립트", "The build script"]]
  ),
  question(
    ["미들웨어 등록 순서가 중요한 이유는?", "Why does middleware order matter?"],
    [["등록된 순서대로 실행되므로 인증이 라우트보다 앞서야 한다", "They run in order, so authentication must come before the route"], ["순서는 상관없다", "Order does not matter"], ["알파벳 순으로 실행된다", "They run alphabetically"], ["역순으로 실행된다", "They run in reverse"]]
  ),
  question(
    ["오류 처리 미들웨어를 어디에 두어야 하나?", "Where does an error-handling middleware belong?"],
    [["모든 라우트 뒤, 체인의 마지막", "After every route, at the end of the chain"], ["체인의 맨 앞", "At the very start of the chain"], ["라우트마다 중간에", "In the middle of each route"], ["위치는 상관없다", "Its position does not matter"]]
  ),
  question(
    ["인증 미들웨어가 통과시킨 사용자 정보를 다음 단계에 전달하는 방법은?", "How does auth middleware hand the resolved user to later steps?"],
    [["요청 객체에 담아 전달한다", "Attach it to the request object"], ["전역 변수에 저장한다", "Store it in a global variable"], ["응답 헤더에 담는다", "Put it in a response header"], ["파일에 기록한다", "Write it to a file"]]
  ),
  question(
    ["요청마다 소요 시간을 남기려면?", "How do you record how long each request took?"],
    [["시작 시각을 기록하는 로깅 미들웨어를 둔다", "Add a logging middleware that records the start time"], ["라우트마다 직접 계산한다", "Compute it inside every route by hand"], ["클라이언트에게 묻는다", "Ask the client"], ["데이터베이스에서 조회한다", "Look it up in the database"]]
  ),
  question(
    ["특정 라우트에만 미들웨어를 적용하려면?", "How do you apply middleware to only some routes?"],
    [["해당 라우트나 라우터 그룹에 붙인다", "Attach it to that route or router group"], ["전역에 등록한 뒤 안에서 분기한다", "Register it globally and branch inside"], ["불가능하다", "It is impossible"], ["미들웨어 이름을 바꾼다", "Rename the middleware"]]
  ),
  question(
    ["요청 본문 크기를 제한하는 미들웨어의 목적은?", "Why limit request body size with middleware?"],
    [["과도한 페이로드로 자원이 고갈되는 것을 막는다", "It stops oversized payloads from exhausting resources"], ["응답을 빠르게 한다", "It makes responses faster"], ["로그를 줄인다", "It reduces logging"], ["라우트를 단순화한다", "It simplifies routes"]]
  ),
  question(
    ["비동기 핸들러에서 던진 오류가 처리되지 않으면?", "What happens to an error thrown in an async handler that is never caught?"],
    [["응답이 멈추거나 프로세스가 불안정해질 수 있다", "The response can hang or the process can become unstable"], ["자동으로 404가 반환된다", "A 404 is returned automatically"], ["다음 요청에서 처리된다", "It is handled on the next request"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
];

/** LV.3 controller-warden — Controller */
const controllerWardenQuiz: readonly QuizQuestion[] = [
  question(
    ["컨트롤러가 맡는 역할은?", "What is a controller responsible for?"],
    [["요청 해석과 서비스 호출, 응답 구성을 조정한다", "Coordinating request parsing, service calls and the response"], ["업무 규칙을 모두 직접 구현한다", "Implementing every business rule itself"], ["데이터베이스 테이블을 생성한다", "Creating database tables"], ["HTML을 디자인한다", "Designing the HTML"]]
  ),
  question(
    ["컨트롤러가 비대해질 때의 문제는?", "What goes wrong when a controller grows fat?"],
    [["업무 규칙이 HTTP에 묶여 테스트와 재사용이 어려워진다", "Business rules bind to HTTP, making them hard to test and reuse"], ["응답이 느려진다", "Responses get slower"], ["라우트가 사라진다", "Routes disappear"], ["문법 오류가 난다", "It causes syntax errors"]]
  ),
  question(
    ["요청 값 검증은 어디에서 해야 하나?", "Where should request validation happen?"],
    [["컨트롤러 진입 지점에서 먼저 검증한다", "At the controller's entry point, before anything else"], ["데이터베이스에 도착한 뒤", "After it reaches the database"], ["응답을 보낸 뒤", "After the response is sent"], ["검증하지 않는다", "It should not happen"]]
  ),
  question(
    ["도메인 객체를 그대로 응답으로 내보내면 생기는 문제는?", "What is the risk of returning a domain object straight to the client?"],
    [["내부 필드가 의도치 않게 노출된다", "Internal fields leak unintentionally"], ["응답이 커진다는 점뿐이다", "Only that the response is larger"], ["문법 오류가 난다", "It causes a syntax error"], ["아무 문제가 없다", "There is no problem"]]
  ),
  question(
    ["응답 전용으로 데이터를 정리해 담는 객체를 부르는 말은?", "What is an object shaped specifically for a response called?"],
    ["DTO", "ORM", "DAO", "RPC"]
  ),
  question(
    ["업무 규칙 위반을 컨트롤러가 어떻게 전달해야 하나?", "How should a controller report a business rule violation?"],
    [["알맞은 상태 코드와 설명이 담긴 오류 응답으로 변환한다", "Translate it into an error response with a fitting status code"], ["스택 트레이스를 그대로 노출한다", "Expose the raw stack trace"], ["항상 200으로 응답한다", "Always respond with 200"], ["응답 없이 연결을 끊는다", "Drop the connection"]]
  ),
  question(
    ["여러 컨트롤러에 같은 오류 변환 코드가 반복될 때 해법은?", "What solves the same error translation repeated in many controllers?"],
    [["공통 오류 처리기로 한곳에 모은다", "Centralize it in a shared error handler"], ["각 컨트롤러에 복사한다", "Copy it into each controller"], ["오류를 무시한다", "Ignore the errors"], ["라우트를 합친다", "Merge the routes"]]
  ),
  question(
    ["컨트롤러를 테스트하기 쉽게 만드는 조건은?", "What makes a controller easy to test?"],
    [["의존성이 밖에서 주입되고 로직이 얇아야 한다", "Dependencies come from outside and the logic stays thin"], ["전역 변수를 많이 써야 한다", "It should use many globals"], ["데이터베이스를 직접 열어야 한다", "It should open the database itself"], ["라우트를 직접 등록해야 한다", "It should register routes itself"]]
  ),
  question(
    ["응답 상태 코드를 결정하는 책임은 어디에 있나?", "Where does the responsibility for the status code belong?"],
    [["HTTP를 아는 컨트롤러 계층", "In the controller layer, which knows HTTP"], ["도메인 서비스", "In the domain service"], ["데이터 저장소", "In the data store"], ["미들웨어에서만", "Only in middleware"]]
  ),
  question(
    ["같은 로직을 HTTP와 배치 작업에서 함께 써야 할 때 방법은?", "How do you share one rule between an HTTP path and a batch job?"],
    [["HTTP와 무관한 서비스로 로직을 옮긴다", "Move the rule into a service with no HTTP knowledge"], ["컨트롤러를 배치에서 호출한다", "Call the controller from the batch job"], ["코드를 복사한다", "Copy the code"], ["라우트를 배치용으로 만든다", "Create a route just for the batch job"]]
  ),
];

/** LV.4 framework-orchestrator — Service layer */
const frameworkOrchestratorQuiz: readonly QuizQuestion[] = [
  question(
    ["서비스 계층이 담는 것은?", "What does the service layer hold?"],
    [["HTTP 표현과 분리된 업무 규칙", "Business rules, separated from HTTP representation"], ["라우트 정의", "Route definitions"], ["HTML 템플릿", "HTML templates"], ["CSS 스타일", "CSS styles"]]
  ),
  question(
    ["서비스 계층을 두면 좋은 이유는?", "Why introduce a service layer?"],
    [["같은 규칙을 HTTP, 배치, 스크립트 어디서나 재사용할 수 있다", "The same rule serves HTTP, batch jobs and scripts alike"], ["응답이 빨라진다", "Responses get faster"], ["코드 줄 수가 줄어든다", "It always reduces line count"], ["데이터베이스가 필요 없어진다", "The database becomes unnecessary"]]
  ),
  question(
    ["서비스 계층이 알면 안 되는 것은?", "What must the service layer NOT know about?"],
    [["요청 객체나 상태 코드 같은 HTTP 세부", "HTTP details such as the request object or status codes"], ["업무 규칙", "Business rules"], ["도메인 모델", "The domain model"], ["저장소 인터페이스", "The repository interface"]]
  ),
  question(
    ["데이터 접근을 감싸 서비스에서 쓰게 하는 패턴은?", "Which pattern wraps data access for the service to use?"],
    [["리포지터리", "The repository pattern"], ["싱글턴", "The singleton pattern"], ["옵서버", "The observer pattern"], ["데코레이터", "The decorator pattern"]]
  ),
  question(
    ["리포지터리를 인터페이스로 두면 좋은 점은?", "What is gained by defining a repository as an interface?"],
    [["테스트에서 가짜 구현으로 바꿔 끼울 수 있다", "Tests can swap in a fake implementation"], ["쿼리가 빨라진다", "Queries run faster"], ["스키마가 자동 생성된다", "The schema is generated automatically"], ["트랜잭션이 필요 없어진다", "Transactions become unnecessary"]]
  ),
  question(
    ["여러 저장 작업을 하나의 단위로 묶어야 할 때 필요한 것은?", "What do you need when several writes must succeed or fail together?"],
    [["트랜잭션 경계를 서비스에서 정한다", "A transaction boundary defined in the service"], ["각 저장소가 알아서 커밋한다", "Each repository committing on its own"], ["컨트롤러에서 반복 호출한다", "Repeated calls from the controller"], ["미들웨어에서 처리한다", "Handling it in middleware"]]
  ),
  question(
    ["계층을 나눌 때 의존 방향으로 바람직한 것은?", "Which dependency direction is desirable between layers?"],
    [["바깥 계층이 안쪽 도메인에 의존한다", "Outer layers depend on the inner domain"], ["도메인이 컨트롤러에 의존한다", "The domain depends on controllers"], ["서로 양방향으로 의존한다", "They depend on each other in both directions"], ["의존이 전혀 없어야 한다", "There should be no dependencies at all"]]
  ),
  question(
    ["서비스가 다른 서비스를 지나치게 많이 호출하면?", "What if a service calls a great many other services?"],
    [["책임이 흐려지므로 경계를 다시 나눠야 한다", "Responsibilities blur, and the boundaries need redrawing"], ["성능만 느려진다", "Only performance suffers"], ["테스트가 쉬워진다", "Testing gets easier"], ["문제가 없다", "Nothing is wrong"]]
  ),
  question(
    ["도메인 규칙을 데이터베이스 제약에만 의존하면?", "What is the risk of relying only on database constraints for a rule?"],
    [["규칙의 의도가 코드에 드러나지 않고 오류 처리가 어렵다", "The intent is invisible in the code and errors are hard to handle"], ["성능이 항상 나빠진다", "Performance always suffers"], ["제약이 무시된다", "The constraint is ignored"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["서비스 계층 테스트에서 주로 확인할 것은?", "What should service-layer tests mainly verify?"],
    [["업무 규칙이 조건별로 올바른 결과를 내는지", "That business rules produce the right outcome for each condition"], ["응답 헤더의 값", "The response header values"], ["HTML 마크업", "The HTML markup"], ["라우트 경로 문자열", "The route path strings"]]
  ),
];

/** LV.5 service-guardian — Dependency injection */
const serviceGuardianQuiz: readonly QuizQuestion[] = [
  question(
    ["의존성 주입이 뜻하는 것은?", "What does dependency injection mean?"],
    [["객체가 의존성을 직접 만들지 않고 외부에서 받는다", "An object receives its dependencies instead of constructing them"], ["객체가 의존성을 스스로 생성한다", "An object creates its own dependencies"], ["의존성을 모두 제거한다", "Every dependency is removed"], ["전역 변수를 사용한다", "Global variables are used"]]
  ),
  question(
    ["의존성 주입의 가장 실용적인 이점은?", "What is the most practical benefit of dependency injection?"],
    [["테스트에서 대체 구현으로 갈아 끼울 수 있다", "Tests can substitute an alternative implementation"], ["코드가 항상 짧아진다", "The code always gets shorter"], ["실행 속도가 빨라진다", "Execution gets faster"], ["타입이 필요 없어진다", "Types become unnecessary"]]
  ),
  question(
    ["클래스 안에서 new로 데이터베이스 클라이언트를 만들면?", "What if a class constructs its database client with new inside itself?"],
    [["구체 구현에 묶여 테스트에서 바꿀 수 없다", "It binds to a concrete implementation that tests cannot replace"], ["성능이 좋아진다", "Performance improves"], ["타입이 안전해진다", "It becomes type-safe"], ["문제가 없다", "Nothing is wrong"]]
  ),
  question(
    ["가장 흔하고 명시적인 주입 방식은?", "Which injection style is the most common and explicit?"],
    [["생성자 주입", "Constructor injection"], ["전역 변수 주입", "Global variable injection"], ["런타임 리플렉션", "Runtime reflection"], ["파일 기반 주입", "File-based injection"]]
  ),
  question(
    ["구체 클래스 대신 인터페이스에 의존하라는 원칙은?", "Which principle says to depend on an abstraction, not a concrete class?"],
    [["의존 역전 원칙", "The dependency inversion principle"], ["단일 책임 원칙", "The single responsibility principle"], ["개방 폐쇄 원칙", "The open-closed principle"], ["인터페이스 분리 원칙", "The interface segregation principle"]]
  ),
  question(
    ["의존성을 하나의 인스턴스로 공유하는 수명 설정은?", "Which lifetime shares a single instance everywhere?"],
    [["싱글턴", "Singleton"], ["요청 범위", "Request scoped"], ["일시적", "Transient"], ["세션 범위", "Session scoped"]]
  ),
  question(
    ["요청마다 새 인스턴스가 필요한 경우는?", "When is a per-request instance needed?"],
    [["요청에 묶인 상태나 트랜잭션을 담을 때", "When it carries request-bound state or a transaction"], ["설정 값을 읽을 때", "When it just reads configuration"], ["로거를 쓸 때", "When it is a logger"], ["상수를 담을 때", "When it holds constants"]]
  ),
  question(
    ["상태를 가진 객체를 싱글턴으로 두면?", "What is the danger of making a stateful object a singleton?"],
    [["요청 사이에 상태가 새어 나가 동시성 버그를 만든다", "State leaks between requests and creates concurrency bugs"], ["메모리를 더 쓴다", "It uses more memory"], ["항상 더 안전하다", "It is always safer"], ["영향이 없다", "It has no effect"]]
  ),
  question(
    ["두 클래스가 서로를 주입하려 할 때 생기는 문제는?", "What happens when two classes try to inject each other?"],
    [["순환 의존이 생겨 설계를 다시 나눠야 한다", "A circular dependency forms and the design needs splitting"], ["성능만 느려진다", "Only performance suffers"], ["컨테이너가 자동으로 해결한다", "The container resolves it silently"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["설정값을 코드 곳곳에서 직접 읽는 대신 권장되는 방식은?", "What is recommended instead of reading configuration all over the code?"],
    [["한곳에서 읽어 타입 있는 객체로 주입한다", "Read it once and inject it as a typed object"], ["필요할 때마다 환경 변수를 읽는다", "Read environment variables wherever needed"], ["전역 변수에 담는다", "Store it in a global variable"], ["하드코딩한다", "Hardcode the values"]]
  ),
];

const serverFrameworkQuiz: readonly (readonly QuizQuestion[])[] = [
  routeScoutQuiz,
  middlewarePairQuiz,
  controllerWardenQuiz,
  frameworkOrchestratorQuiz,
  serviceGuardianQuiz,
];

export default serverFrameworkQuiz;
