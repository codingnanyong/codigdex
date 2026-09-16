import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 key-scale — Hash */
const keyScaleQuiz: readonly QuizQuestion[] = [
  question(
    ["비밀번호를 해시로 저장하는 이유는?", "Why store passwords as hashes?"],
    [["유출되어도 원래 비밀번호를 복원하기 어렵다", "Even if the store leaks, the original password is hard to recover"], ["저장 공간이 줄어든다", "It saves storage space"], ["로그인이 빨라진다", "It makes login faster"], ["비밀번호를 잊어도 복구할 수 있다", "Forgotten passwords can be recovered"]]
  ),
  question(
    ["해시 함수의 핵심 성질은?", "What is the defining property of a hash function?"],
    [["같은 입력은 항상 같은 값을 내고 되돌리기 어렵다", "The same input always yields the same value, and reversing it is hard"], ["언제든 원래 값으로 되돌릴 수 있다", "It can always be reversed to the original"], ["실행할 때마다 값이 달라진다", "It gives a different value each run"], ["입력 길이를 그대로 유지한다", "It preserves the input length"]]
  ),
  question(
    ["해시에 솔트(salt)를 더하는 이유는?", "Why add a salt to a hash?"],
    [["같은 비밀번호라도 저장된 값이 달라져 미리 계산한 표를 무력화한다", "Identical passwords store differently, defeating precomputed tables"], ["해시를 짧게 만든다", "It shortens the hash"], ["계산 속도를 높인다", "It speeds up the computation"], ["비밀번호를 복호화할 수 있게 한다", "It makes the password decryptable"]]
  ),
  question(
    ["비밀번호 저장에 SHA-256을 그대로 쓰면 안 되는 이유는?", "Why is plain SHA-256 a poor choice for storing passwords?"],
    [["너무 빨라 대량 추측 공격에 유리하다", "It is too fast, which helps large-scale guessing attacks"], ["충돌이 매일 발생한다", "Collisions happen daily"], ["출력 길이가 너무 길다", "Its output is too long"], ["표준이 아니기 때문이다", "It is not a standard"]]
  ),
  question(
    ["비밀번호 해싱에 권장되는 알고리즘은?", "Which algorithm is recommended for password hashing?"],
    ["bcrypt", "MD5", "SHA-1", "CRC32"]
  ),
  question(
    ["암호화와 해싱의 차이는?", "How does encryption differ from hashing?"],
    [["암호화는 키로 되돌릴 수 있고 해싱은 단방향이다", "Encryption is reversible with a key; hashing is one-way"], ["해싱만 키를 쓴다", "Only hashing uses a key"], ["둘은 완전히 같다", "They are exactly the same"], ["암호화는 항상 더 느리다", "Encryption is always slower"]]
  ),
  question(
    ["서로 다른 입력이 같은 해시를 만드는 상황을 부르는 말은?", "What is it called when two different inputs produce the same hash?"],
    [["충돌", "A collision"], ["솔트", "A salt"], ["페퍼", "A pepper"], ["라운드", "A round"]]
  ),
  question(
    ["더 이상 안전하다고 보지 않는 해시 알고리즘은?", "Which hash algorithm is no longer considered safe?"],
    ["MD5", "SHA-256", "SHA-3", "BLAKE2"]
  ),
  question(
    ["파일이 전송 중 변조되지 않았는지 확인하는 데 해시를 쓰는 이유는?", "Why use a hash to check that a file was not altered in transit?"],
    [["내용이 조금만 달라도 값이 완전히 달라진다", "The smallest change produces a completely different value"], ["파일 크기를 알 수 있어서다", "It reveals the file size"], ["전송 속도가 빨라져서다", "It speeds up the transfer"], ["파일을 압축해 주기 때문이다", "It compresses the file"]]
  ),
  question(
    ["비밀번호를 평문으로 저장했다는 사실을 알았을 때 해야 할 일은?", "What must you do on discovering passwords were stored in plaintext?"],
    [["해싱으로 전환하고 기존 비밀번호를 모두 재설정하게 한다", "Move to hashing and force every existing password to be reset"], ["저장 파일 이름만 바꾼다", "Rename the storage file"], ["로그 기록만 지운다", "Delete the log entries"], ["그대로 두고 지켜본다", "Leave it and watch"]]
  ),
];

/** LV.2 identity-keeper — Authentication */
const identityKeeperQuiz: readonly QuizQuestion[] = [
  question(
    ["인증(authentication)이 확인하는 것은?", "What does authentication verify?"],
    [["사용자가 누구인지", "Who the user is"], ["사용자가 무엇을 할 수 있는지", "What the user may do"], ["서버의 성능", "The server's performance"], ["데이터의 형식", "The data format"]]
  ),
  question(
    ["인증과 인가의 차이를 바르게 설명한 것은?", "Which correctly distinguishes authentication from authorization?"],
    [["인증은 신원 확인, 인가는 권한 판단이다", "Authentication establishes identity, authorization decides permission"], ["인증은 권한 판단, 인가는 신원 확인이다", "Authentication decides permission, authorization establishes identity"], ["둘은 같은 말이다", "They mean the same thing"], ["인가가 항상 먼저 일어난다", "Authorization always comes first"]]
  ),
  question(
    ["다단계 인증(MFA)이 요구하는 것은?", "What does multi-factor authentication require?"],
    [["서로 다른 종류의 증거를 둘 이상", "Two or more pieces of evidence of different kinds"], ["비밀번호를 두 번 입력", "Entering the password twice"], ["더 긴 비밀번호 하나", "One longer password"], ["아이디를 두 개 사용", "Using two user names"]]
  ),
  question(
    ["다음 중 '가지고 있는 것' 요소에 해당하는 것은?", "Which is a 'something you have' factor?"],
    [["휴대폰의 인증 앱", "An authenticator app on a phone"], ["비밀번호", "A password"], ["지문", "A fingerprint"], ["보안 질문", "A security question"]]
  ),
  question(
    ["로그인 실패 메시지를 모호하게 적는 이유는?", "Why keep a failed-login message vague?"],
    [["어떤 계정이 존재하는지 알려 주지 않기 위해", "So it does not reveal which accounts exist"], ["글자 수를 줄이기 위해", "To use fewer characters"], ["번역을 쉽게 하기 위해", "To make translation easier"], ["로그를 줄이기 위해", "To shrink the logs"]]
  ),
  question(
    ["로그인 시도 횟수를 제한하는 이유는?", "Why limit repeated login attempts?"],
    [["무차별 대입 공격을 늦춘다", "It slows brute-force attacks"], ["서버 비용을 줄인다", "It reduces server cost"], ["비밀번호를 짧게 만든다", "It allows shorter passwords"], ["세션을 길게 유지한다", "It keeps sessions alive longer"]]
  ),
  question(
    ["세션 쿠키에 HttpOnly 플래그를 붙이는 이유는?", "Why set the HttpOnly flag on a session cookie?"],
    [["자바스크립트가 쿠키를 읽지 못하게 막는다", "It stops JavaScript from reading the cookie"], ["쿠키를 암호화한다", "It encrypts the cookie"], ["쿠키를 영구 보관한다", "It makes the cookie permanent"], ["쿠키 크기를 줄인다", "It shrinks the cookie"]]
  ),
  question(
    ["쿠키의 Secure 플래그가 하는 일은?", "What does a cookie's Secure flag do?"],
    [["HTTPS 연결에서만 전송되게 한다", "It sends the cookie only over HTTPS"], ["쿠키를 해싱한다", "It hashes the cookie"], ["만료 시간을 없앤다", "It removes the expiry"], ["도메인을 고정한다", "It pins the domain"]]
  ),
  question(
    ["로그인 성공 직후 세션 식별자를 새로 발급하는 이유는?", "Why issue a new session id right after a successful login?"],
    [["세션 고정 공격을 막는다", "It prevents session fixation attacks"], ["로그인을 빠르게 한다", "It makes login faster"], ["쿠키 크기를 줄인다", "It shrinks the cookie"], ["비밀번호를 숨긴다", "It hides the password"]]
  ),
  question(
    ["다른 서비스 계정으로 로그인하게 해 주는 위임 표준은?", "Which standard delegates login to another service's account?"],
    ["OAuth 2.0", "SHA-256", "TLS 1.3", "SAMLite"]
  ),
];

/** LV.3 identity-keywarden — Authorization */
const identityKeywardenQuiz: readonly QuizQuestion[] = [
  question(
    ["인가(authorization)가 결정하는 것은?", "What does authorization decide?"],
    [["확인된 사용자가 무엇을 할 수 있는지", "What an authenticated user may do"], ["사용자가 누구인지", "Who the user is"], ["비밀번호의 강도", "How strong a password is"], ["세션의 길이", "How long a session lasts"]]
  ),
  question(
    ["역할 기반 접근 제어(RBAC)의 특징은?", "What characterizes role-based access control?"],
    [["권한을 역할에 묶고 사용자에게 역할을 준다", "Permissions attach to roles, and roles attach to users"], ["사용자마다 권한을 일일이 직접 설정한다", "Each user's permissions are set one by one"], ["모든 사용자에게 같은 권한을 준다", "Every user gets the same permissions"], ["권한을 요청 시점에 무작위로 정한다", "Permissions are randomized per request"]]
  ),
  question(
    ["권한 검사를 프런트엔드에서만 하면 안 되는 이유는?", "Why is a front-end-only permission check never enough?"],
    [["요청은 브라우저를 거치지 않고도 보낼 수 있다", "Requests can be sent without going through the browser at all"], ["화면이 느려지기 때문이다", "It slows down the screen"], ["번역이 어려워지기 때문이다", "It complicates translation"], ["코드가 길어지기 때문이다", "It makes the code longer"]]
  ),
  question(
    ["URL의 id만 바꿔 남의 자료를 보는 취약점은?", "Which flaw lets someone read another's data by editing an id in the URL?"],
    [["안전하지 않은 직접 객체 참조", "Insecure direct object reference"], ["크로스 사이트 스크립팅", "Cross-site scripting"], ["SQL 인젝션", "SQL injection"], ["세션 고정", "Session fixation"]]
  ),
  question(
    ["자원 소유권 검사를 어디서 해야 하나?", "Where must an ownership check happen?"],
    [["서버에서 요청을 처리하기 직전에", "On the server, right before the request is handled"], ["브라우저에서 화면을 그릴 때", "In the browser when the screen renders"], ["로그를 남길 때", "When the log line is written"], ["배포할 때 한 번", "Once, at deploy time"]]
  ),
  question(
    ["사용자 속성과 환경 조건까지 보고 권한을 정하는 모델은?", "Which model decides access from user attributes and context?"],
    ["ABAC", "RBAC", "ACL", "MFA"]
  ),
  question(
    ["다른 사이트에서 사용자의 권한으로 요청을 보내게 만드는 공격은?", "Which attack makes another site issue requests with the user's privileges?"],
    ["CSRF", "XSS", "SSRF", "DDoS"]
  ),
  question(
    ["CSRF를 막는 대표적인 방법은?", "Which is a standard defense against CSRF?"],
    [["CSRF 토큰과 SameSite 쿠키를 함께 쓴다", "Use a CSRF token together with SameSite cookies"], ["비밀번호를 더 길게 한다", "Require longer passwords"], ["HTTPS만 켠다", "Simply enable HTTPS"], ["로그를 늘린다", "Log more"]]
  ),
  question(
    ["권한 변경 같은 중요한 동작에 남겨야 하는 것은?", "What must accompany a sensitive action such as a permission change?"],
    [["누가 언제 무엇을 바꿨는지 남기는 감사 로그", "An audit log of who changed what and when"], ["화면 스크린숏", "A screenshot"], ["임시 비밀번호", "A temporary password"], ["캐시 무효화", "A cache purge"]]
  ),
  question(
    ["기본 접근 정책으로 안전한 것은?", "Which default access policy is the safe one?"],
    [["기본은 거부하고 필요한 것만 허용한다", "Deny by default and allow only what is needed"], ["기본은 허용하고 문제를 차단한다", "Allow by default and block problems as they appear"], ["관리자만 거부한다", "Deny only administrators"], ["정책 없이 운영한다", "Operate with no policy"]]
  ),
];

/** LV.4 access-bastion — Input validation */
const accessBastionQuiz: readonly QuizQuestion[] = [
  question(
    ["입력 검증의 기본 원칙은?", "What is the founding principle of input validation?"],
    [["외부에서 온 모든 입력을 신뢰하지 않는다", "Never trust any input that came from outside"], ["로그인한 사용자의 입력은 신뢰한다", "Trust input from logged-in users"], ["길이만 확인하면 충분하다", "Checking the length is enough"], ["프런트엔드 검사로 충분하다", "Front-end checks are sufficient"]]
  ),
  question(
    ["허용 목록과 차단 목록 중 더 안전한 방식은?", "Which is safer, an allow list or a block list?"],
    [["허용 목록 — 통과시킬 것만 정의한다", "An allow list, because it defines only what may pass"], ["차단 목록 — 막을 것만 정의한다", "A block list, because it defines only what to stop"], ["둘은 같은 수준이다", "They are equally safe"], ["둘 다 필요 없다", "Neither is needed"]]
  ),
  question(
    ["SQL 인젝션을 막는 가장 확실한 방법은?", "What is the most reliable defense against SQL injection?"],
    [["매개변수화 쿼리를 쓴다", "Use parameterized queries"], ["작은따옴표만 제거한다", "Strip single quotes"], ["쿼리를 암호화한다", "Encrypt the query"], ["오류 메시지를 숨긴다", "Hide the error message"]]
  ),
  question(
    ["사용자 입력을 그대로 화면에 출력할 때 생기는 취약점은?", "Which flaw appears when user input is rendered to the page as-is?"],
    ["XSS", "CSRF", "SSRF", "RCE"]
  ),
  question(
    ["XSS를 막기 위해 출력 시 해야 할 일은?", "What must happen on output to prevent XSS?"],
    [["맥락에 맞게 이스케이프하거나 인코딩한다", "Escape or encode it for the context it lands in"], ["입력 길이를 늘린다", "Increase the input length limit"], ["HTTPS를 켠다", "Turn on HTTPS"], ["쿠키를 지운다", "Clear cookies"]]
  ),
  question(
    ["파일 경로에 ../ 를 넣어 다른 디렉터리에 접근하는 공격은?", "Which attack uses ../ in a path to reach other directories?"],
    [["경로 순회", "Path traversal"], ["세션 고정", "Session fixation"], ["권한 상승", "Privilege escalation"], ["재생 공격", "A replay attack"]]
  ),
  question(
    ["업로드된 파일을 다룰 때 지켜야 할 것은?", "What must you do when handling an uploaded file?"],
    [["확장자와 실제 형식을 검사하고 실행 불가한 위치에 저장한다", "Check the extension and real type, and store it where it cannot execute"], ["원래 파일명을 그대로 쓴다", "Keep the original file name as given"], ["웹 루트에 바로 저장한다", "Save it straight into the web root"], ["크기만 확인한다", "Only check the size"]]
  ),
  question(
    ["서버가 공격자가 지정한 내부 주소로 요청을 보내게 만드는 취약점은?", "Which flaw makes a server issue requests to an attacker-chosen internal address?"],
    ["SSRF", "XSS", "CSRF", "CSP"]
  ),
  question(
    ["운영 환경에서 상세한 오류 스택을 사용자에게 보여 주면?", "What happens when detailed error stacks are shown to users in production?"],
    [["내부 구조와 경로가 노출돼 공격에 도움이 된다", "Internal structure and paths leak, helping an attacker"], ["디버깅이 빨라지므로 권장된다", "It is recommended because debugging gets faster"], ["아무 영향이 없다", "It has no effect"], ["성능이 좋아진다", "Performance improves"]]
  ),
  question(
    ["검증 로직을 어디에 두는 것이 안전한가?", "Where is validation logic safe to live?"],
    [["서버에 반드시 두고, 클라이언트 검사는 편의로만 쓴다", "Always on the server, with client checks only as a convenience"], ["클라이언트에만 둔다", "Only on the client"], ["데이터베이스 트리거에만 둔다", "Only in database triggers"], ["로드 밸런서에만 둔다", "Only on the load balancer"]]
  ),
];

/** LV.5 zero-trust-bastion — Least privilege */
const zeroTrustBastionQuiz: readonly QuizQuestion[] = [
  question(
    ["최소 권한 원칙이 뜻하는 것은?", "What does the principle of least privilege mean?"],
    [["작업에 필요한 최소한의 권한만 준다", "Grant only the permissions a task actually needs"], ["관리자 권한을 기본으로 준다", "Grant admin rights by default"], ["권한을 아예 두지 않는다", "Use no permissions at all"], ["권한을 자주 바꾼다", "Change permissions frequently"]]
  ),
  question(
    ["제로 트러스트의 핵심 전제는?", "What is the core premise of zero trust?"],
    [["내부 네트워크라는 이유만으로 신뢰하지 않는다", "Nothing is trusted merely for being on the internal network"], ["방화벽 안은 모두 안전하다", "Everything inside the firewall is safe"], ["인증은 한 번이면 충분하다", "Authenticating once is enough"], ["암호화는 외부 통신에만 필요하다", "Encryption is only needed externally"]]
  ),
  question(
    ["서비스 계정에 관리자 권한을 주면 생기는 위험은?", "What is the risk of giving a service account admin rights?"],
    [["그 계정 하나가 뚫리면 피해 범위가 전체로 번진다", "Compromising that one account spreads the damage everywhere"], ["배포가 느려진다", "Deployments get slower"], ["로그가 줄어든다", "There are fewer logs"], ["비용이 늘어난다", "Costs increase"]]
  ),
  question(
    ["자격 증명을 주기적으로 교체하는 것을 부르는 말은?", "What is periodically replacing credentials called?"],
    [["로테이션", "Rotation"], ["마이그레이션", "Migration"], ["샤딩", "Sharding"], ["스케일링", "Scaling"]]
  ),
  question(
    ["소스 코드 저장소에 비밀 키를 커밋하면?", "What happens when a secret is committed to a source repository?"],
    [["이력에 남으므로 즉시 폐기하고 새로 발급해야 한다", "It persists in history, so it must be revoked and reissued at once"], ["다음 커밋에서 자동으로 지워진다", "The next commit removes it automatically"], ["비공개 저장소라면 안전하다", "It is safe as long as the repository is private"], ["문제가 되지 않는다", "It is not a problem"]]
  ),
  question(
    ["비밀 값을 안전하게 보관하는 올바른 방법은?", "What is the right way to keep secret values?"],
    [["전용 시크릿 저장소나 환경 변수에 두고 접근을 제한한다", "Keep them in a dedicated secret store or environment variables with restricted access"], ["설정 파일에 평문으로 적는다", "Write them as plaintext in a config file"], ["코드 주석에 남긴다", "Note them in a code comment"], ["로그에 출력해 둔다", "Print them to the logs"]]
  ),
  question(
    ["침해가 일어났다는 가정으로 피해를 가두는 설계 개념은?", "Which design idea contains damage by assuming a breach already happened?"],
    [["침해 범위 최소화", "Limiting the blast radius"], ["수직 확장", "Vertical scaling"], ["캐시 워밍", "Cache warming"], ["코드 난독화", "Code obfuscation"]]
  ),
  question(
    ["임시로만 권한을 올렸다가 자동으로 회수하는 방식은?", "Which approach raises privileges temporarily and revokes them automatically?"],
    [["적시 권한 부여", "Just-in-time access"], ["영구 관리자 권한", "Standing admin rights"], ["공유 계정", "Shared accounts"], ["무제한 토큰", "Non-expiring tokens"]]
  ),
  question(
    ["의존성 라이브러리의 알려진 취약점을 다루는 방법은?", "How should known vulnerabilities in dependencies be handled?"],
    [["정기적으로 스캔하고 패치된 버전으로 올린다", "Scan regularly and upgrade to patched versions"], ["버전을 영원히 고정한다", "Pin the versions forever"], ["경고를 무시한다", "Ignore the warnings"], ["라이브러리를 직접 복사해 둔다", "Copy the library source into the project"]]
  ),
  question(
    ["보안을 개발 흐름 초기부터 반영하는 접근을 부르는 말은?", "What is building security into the workflow from the start called?"],
    [["시프트 레프트", "Shifting left"], ["빅뱅 릴리스", "A big-bang release"], ["핫픽스 배포", "Hotfix deployment"], ["롤링 업데이트", "A rolling update"]]
  ),
];

const securityAuthQuiz: readonly (readonly QuizQuestion[])[] = [
  keyScaleQuiz,
  identityKeeperQuiz,
  identityKeywardenQuiz,
  accessBastionQuiz,
  zeroTrustBastionQuiz,
];

export default securityAuthQuiz;
