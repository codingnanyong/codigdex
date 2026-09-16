import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 message-pair — Request/Response */
const messagePairQuiz: readonly QuizQuestion[] = [
  question(
    ["HTTP 통신의 기본 구조를 가장 잘 설명한 것은?", "Which best describes the basic structure of HTTP communication?"],
    [["클라이언트가 요청하고 서버가 응답한다", "A client sends a request and a server sends a response"], ["서버가 먼저 요청하고 클라이언트가 응답한다", "The server requests first and the client responds"], ["둘이 동시에 응답만 주고받는다", "Both sides only exchange responses"], ["요청 없이 서버가 계속 밀어 넣는다", "The server pushes continuously without any request"]]
  ),
  question(["서버에서 자료를 조회할 때 쓰는 HTTP 메서드는?", "Which HTTP method reads data from a server?"], ["GET", "POST", "DELETE", "PATCH"]),
  question(["새 자료를 만들어 달라고 보낼 때 주로 쓰는 메서드는?", "Which method typically asks the server to create new data?"], ["POST", "GET", "HEAD", "OPTIONS"]),
  question(
    ["HTTP 요청에 반드시 포함되는 것은?", "Which is always part of an HTTP request?"],
    [["메서드와 경로", "A method and a path"], ["응답 코드", "A status code"], ["데이터베이스 이름", "A database name"], ["서버의 CPU 정보", "The server's CPU information"]]
  ),
  question(
    ["HTTP가 상태를 저장하지 않는다는 말의 뜻은?", "What does it mean that HTTP is stateless?"],
    [["서버가 요청 사이의 맥락을 기본적으로 기억하지 않는다", "The server does not remember context between requests by default"], ["요청을 저장할 수 없다", "Requests cannot be stored at all"], ["응답이 항상 비어 있다", "Responses are always empty"], ["연결이 끊기지 않는다", "The connection never closes"]]
  ),
  question(["요청이나 응답에 담기는 실제 데이터 부분을 부르는 말은?", "What is the actual data carried in a request or response called?"], ["Body", "Header", "Method", "Scheme"]),
  question(
    ["웹 API가 주고받는 데이터 형식으로 가장 널리 쓰이는 것은?", "Which data format is most widely used by web APIs?"],
    ["JSON", "EXE", "PNG", "ZIP"]
  ),
  question(
    ["HTTP 대신 HTTPS를 쓰는 이유는?", "Why use HTTPS instead of HTTP?"],
    [["통신 내용을 암호화해 가로채기를 막는다", "It encrypts traffic so it cannot be read in transit"], ["요청 속도가 항상 두 배 빨라진다", "Requests are always twice as fast"], ["서버 비용이 줄어든다", "It reduces server cost"], ["JSON을 자동으로 만들어 준다", "It generates JSON automatically"]]
  ),
  question(
    ["GET 요청에서 검색어 같은 값을 붙이는 위치는?", "Where do you attach values such as a search term in a GET request?"],
    [["쿼리 문자열", "The query string"], ["요청 본문", "The request body"], ["상태 코드", "The status code"], ["쿠키 이름", "The cookie name"]]
  ),
  question(
    ["같은 요청을 여러 번 보내도 결과가 같은 성질은?", "What is it called when repeating the same request leaves the same result?"],
    [["멱등성", "Idempotence"], ["동시성", "Concurrency"], ["영속성", "Persistence"], ["일관성", "Consistency"]]
  ),
];

/** LV.2 endpoint-messengers — Status code */
const endpointMessengersQuiz: readonly QuizQuestion[] = [
  question(["요청이 성공했음을 뜻하는 대표적인 상태 코드는?", "Which status code most commonly means the request succeeded?"], ["200", "301", "404", "500"]),
  question(["요청한 자원을 찾을 수 없을 때의 상태 코드는?", "Which status code says the requested resource was not found?"], ["404", "400", "403", "410"]),
  question(["서버 내부에서 오류가 났을 때의 상태 코드는?", "Which status code reports an unexpected server-side error?"], ["500", "400", "404", "302"]),
  question(
    ["4xx와 5xx 상태 코드의 차이는?", "What separates 4xx from 5xx status codes?"],
    [["4xx는 요청 쪽 문제, 5xx는 서버 쪽 문제다", "4xx blames the request, 5xx blames the server"], ["4xx는 성공, 5xx는 실패다", "4xx means success and 5xx means failure"], ["4xx는 서버 문제, 5xx는 요청 문제다", "4xx blames the server and 5xx blames the request"], ["둘은 같은 의미다", "They mean the same thing"]]
  ),
  question(
    ["POST로 자원을 새로 만들었을 때 알맞은 상태 코드는?", "Which status code fits a POST that created a new resource?"],
    ["201", "200", "204", "202"]
  ),
  question(
    ["응답 본문 없이 성공을 알릴 때 쓰는 상태 코드는?", "Which status code reports success with no response body?"],
    ["204", "200", "201", "304"]
  ),
  question(
    ["인증되지 않은 사용자에게 돌려주는 상태 코드는?", "Which status code is returned to an unauthenticated caller?"],
    ["401", "403", "400", "409"]
  ),
  question(
    ["누구인지는 알지만 권한이 없을 때의 상태 코드는?", "Which status code means the caller is known but not permitted?"],
    ["403", "401", "404", "405"]
  ),
  question(
    ["자원이 영구적으로 다른 주소로 옮겨졌음을 뜻하는 코드는?", "Which code says a resource moved permanently to a new address?"],
    ["301", "302", "307", "303"]
  ),
  question(
    ["요청 횟수 제한을 넘겼을 때 반환하는 상태 코드는?", "Which status code is returned when a rate limit is exceeded?"],
    ["429", "409", "408", "451"]
  ),
];

/** LV.3 request-courier — Header */
const requestCourierQuiz: readonly QuizQuestion[] = [
  question(
    ["HTTP 헤더가 담는 것은?", "What do HTTP headers carry?"],
    [["본문 외의 인증, 형식 같은 메타데이터", "Metadata such as authentication and format, separate from the body"], ["실제 사용자 데이터만", "Only the actual user data"], ["데이터베이스 스키마", "The database schema"], ["서버의 소스 코드", "The server's source code"]]
  ),
  question(["본문의 데이터 형식을 알리는 헤더는?", "Which header declares the format of the body?"], ["Content-Type", "Accept", "Content-Length", "Host"]),
  question(["클라이언트가 원하는 응답 형식을 알리는 헤더는?", "Which header states the response format the client wants?"], ["Accept", "Content-Type", "Allow", "Vary"]),
  question(["토큰 같은 인증 정보를 담는 표준 헤더는?", "Which standard header carries credentials such as a token?"], ["Authorization", "Cookie", "Referer", "Origin"]),
  question(
    ["JSON 본문을 보낼 때 지정해야 하는 Content-Type 값은?", "Which Content-Type value should you send with a JSON body?"],
    ["application/json", "text/plain", "text/html", "multipart/form-data"]
  ),
  question(
    ["브라우저가 다른 출처의 응답을 읽어도 되는지 정하는 헤더는?", "Which header tells a browser whether it may read a cross-origin response?"],
    ["Access-Control-Allow-Origin", "Content-Security-Policy", "X-Frame-Options", "Strict-Transport-Security"]
  ),
  question(
    ["응답을 얼마나 캐시해도 되는지 지시하는 헤더는?", "Which header instructs how long a response may be cached?"],
    ["Cache-Control", "Expires-At", "Age-Limit", "Last-Fetch"]
  ),
  question(
    ["자원이 바뀌었는지 비교하는 데 쓰는 응답 헤더는?", "Which response header is used to check whether a resource changed?"],
    ["ETag", "Location", "Server", "Connection"]
  ),
  question(
    ["같은 출처 정책(CORS)에서 사전 요청을 보내는 메서드는?", "Which method sends the CORS preflight request?"],
    ["OPTIONS", "HEAD", "TRACE", "CONNECT"]
  ),
  question(
    ["비밀 키를 URL 대신 헤더에 담는 이유는?", "Why put a secret key in a header instead of the URL?"],
    [["URL은 로그와 브라우저 기록에 남기 쉽다", "URLs are easily recorded in logs and browser history"], ["헤더가 더 많은 글자를 담는다", "Headers hold more characters"], ["URL은 암호화되지 않는 형식이다", "URLs cannot be encoded at all"], ["헤더는 서버가 무시한다", "Servers ignore headers"]]
  ),
];

/** LV.4 portal-wardens — REST endpoint */
const portalWardensQuiz: readonly QuizQuestion[] = [
  question(
    ["REST에서 URL이 나타내야 하는 것은?", "What should a URL represent in REST?"],
    [["자원(리소스)", "A resource"], ["실행할 동사", "The verb to run"], ["데이터베이스 테이블 쿼리", "A database query"], ["서버 함수 이름", "A server function name"]]
  ),
  question(
    ["다음 중 REST 규칙에 가장 잘 맞는 엔드포인트는?", "Which endpoint best follows REST conventions?"],
    ["GET /users/42", "GET /getUser?id=42", "POST /user/delete/42", "GET /fetchUserById/42"]
  ),
  question(["기존 자원 전체를 새 내용으로 교체할 때 쓰는 메서드는?", "Which method replaces an existing resource entirely?"], ["PUT", "PATCH", "POST", "GET"]),
  question(["자원의 일부 필드만 수정할 때 쓰는 메서드는?", "Which method updates only some fields of a resource?"], ["PATCH", "PUT", "POST", "HEAD"]),
  question(["자원을 삭제할 때 쓰는 메서드는?", "Which method deletes a resource?"], ["DELETE", "REMOVE", "POST", "DROP"]),
  question(
    ["목록이 아주 길 때 API가 취하는 일반적인 방법은?", "What does an API usually do when a collection is very long?"],
    [["페이지네이션으로 나눠 반환한다", "It paginates the results"], ["전체를 항상 한 번에 반환한다", "It always returns everything at once"], ["요청을 거부한다", "It rejects the request"], ["무작위로 일부만 반환한다", "It returns a random subset"]]
  ),
  question(
    ["API 버전을 나누는 흔한 방식은?", "What is a common way to version an API?"],
    [["/v1/users 처럼 경로에 버전을 둔다", "Put the version in the path, as in /v1/users"], ["요청할 때마다 도메인을 바꾼다", "Change the domain on every request"], ["상태 코드로 버전을 구분한다", "Distinguish versions by status code"], ["본문 길이로 버전을 구분한다", "Distinguish versions by body length"]]
  ),
  question(
    ["GET 요청이 자원을 변경하면 안 되는 이유는?", "Why must a GET request never change a resource?"],
    [["안전한 메서드로 약속돼 있어 캐시와 재시도가 안전해야 한다", "It is defined as safe, so caching and retries must stay harmless"], ["속도가 느려지기 때문이다", "Because it would be slower"], ["브라우저가 지원하지 않기 때문이다", "Because browsers do not support it"], ["본문을 담을 수 없기 때문이다", "Because it cannot carry a body"]]
  ),
  question(
    ["REST API가 오류를 알릴 때 바람직한 방식은?", "How should a REST API report an error?"],
    [["알맞은 상태 코드와 설명이 담긴 본문을 함께 준다", "Return a fitting status code plus a body that explains it"], ["항상 200과 함께 빈 본문을 준다", "Always return 200 with an empty body"], ["응답 없이 연결을 끊는다", "Drop the connection with no response"], ["HTML 오류 페이지를 준다", "Return an HTML error page"]]
  ),
  question(
    ["하위 자원을 표현하는 올바른 경로 형태는?", "Which path shape correctly expresses a nested resource?"],
    ["/users/42/orders", "/orders?getUserOrders=42", "/users-orders-42", "/getOrders/user/42"]
  ),
];

/** LV.5 gateway-guardian — API token */
const gatewayGuardianQuiz: readonly QuizQuestion[] = [
  question(
    ["API 토큰이 증명하는 것은?", "What does an API token prove?"],
    [["요청을 보낸 주체와 그 권한", "Who made the request and what they may do"], ["서버의 물리적 위치", "The server's physical location"], ["응답의 데이터 형식", "The response data format"], ["네트워크 대역폭", "The available bandwidth"]]
  ),
  question(
    ["Bearer 토큰을 보내는 표준 헤더 형태는?", "What is the standard header form for a bearer token?"],
    ["Authorization: Bearer <token>", "Token: <token>", "X-Auth: Bearer <token>", "Cookie: Bearer <token>"]
  ),
  question(
    ["토큰에 만료 시간을 두는 이유는?", "Why give a token an expiry time?"],
    [["유출되더라도 악용될 수 있는 기간을 제한한다", "It limits how long a leaked token can be abused"], ["서버 저장 공간을 아낀다", "It saves server storage"], ["요청 속도를 높인다", "It speeds up requests"], ["토큰 길이를 줄인다", "It shortens the token"]]
  ),
  question(
    ["프런트엔드 코드에 API 비밀 키를 넣으면 안 되는 이유는?", "Why must you never put an API secret in front-end code?"],
    [["브라우저로 전달된 코드는 누구나 읽을 수 있다", "Anyone can read code that is shipped to the browser"], ["파일 크기가 커지기 때문이다", "It makes the bundle larger"], ["문법 오류가 나기 때문이다", "It causes a syntax error"], ["브라우저가 문자열을 지우기 때문이다", "Browsers strip strings"]]
  ),
  question(
    ["JWT가 담고 있는 세 부분은?", "Which three parts make up a JWT?"],
    [["헤더, 페이로드, 서명", "Header, payload, signature"], ["키, 값, 만료", "Key, value, expiry"], ["사용자, 비밀번호, 역할", "User, password, role"], ["요청, 응답, 오류", "Request, response, error"]]
  ),
  question(
    ["JWT 페이로드에 민감 정보를 넣으면 안 되는 이유는?", "Why keep sensitive data out of a JWT payload?"],
    [["서명만 되어 있을 뿐 누구나 디코딩해 읽을 수 있다", "It is only signed, not encrypted, so anyone can decode it"], ["토큰이 무효가 되기 때문이다", "It invalidates the token"], ["서버가 거부하기 때문이다", "Servers reject it"], ["길이 제한이 없기 때문이다", "There is no length limit"]]
  ),
  question(
    ["수명이 짧은 액세스 토큰을 다시 발급받게 해 주는 것은?", "What lets a client obtain a new short-lived access token?"],
    [["리프레시 토큰", "A refresh token"], ["세션 쿠키 이름", "The session cookie name"], ["상태 코드 200", "Status code 200"], ["CORS 헤더", "A CORS header"]]
  ),
  question(
    ["토큰이 유출된 사실을 알았을 때 가장 먼저 할 일은?", "What is the first thing to do when a token is known to have leaked?"],
    [["해당 토큰을 즉시 폐기하고 새로 발급한다", "Revoke that token immediately and issue a new one"], ["만료될 때까지 기다린다", "Wait until it expires on its own"], ["로그만 남겨 둔다", "Just note it in the logs"], ["요청 속도를 낮춘다", "Lower the request rate"]]
  ),
  question(
    ["API 키에 필요한 최소 권한만 주는 원칙은?", "What principle gives an API key only the permissions it needs?"],
    [["최소 권한 원칙", "Least privilege"], ["단일 책임 원칙", "Single responsibility"], ["개방 폐쇄 원칙", "Open-closed"], ["관심사 분리", "Separation of concerns"]]
  ),
  question(
    ["API 게이트웨이가 토큰 검증 외에 흔히 맡는 일은?", "Besides validating tokens, what does an API gateway commonly handle?"],
    [["요청 제한과 라우팅, 로깅", "Rate limiting, routing and logging"], ["데이터베이스 스키마 설계", "Database schema design"], ["프런트엔드 화면 렌더링", "Rendering front-end screens"], ["소스 코드 컴파일", "Compiling source code"]]
  ),
];

const httpApiQuiz: readonly (readonly QuizQuestion[])[] = [
  messagePairQuiz,
  endpointMessengersQuiz,
  requestCourierQuiz,
  portalWardensQuiz,
  gatewayGuardianQuiz,
];

export default httpApiQuiz;
