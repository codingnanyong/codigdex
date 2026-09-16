import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 query-mole — SELECT/WHERE */
const queryMoleQuiz: readonly QuizQuestion[] = [
  question(["테이블에서 데이터를 조회하는 SQL 문장은?", "Which SQL statement reads data from a table?"], ["SELECT", "INSERT", "UPDATE", "DELETE"]),
  question(["조회할 행의 조건을 지정하는 절은?", "Which clause filters which rows are returned?"], ["WHERE", "ORDER BY", "GROUP BY", "HAVING"]),
  question(
    ["users 테이블의 모든 열을 조회하는 문장은?", "Which statement selects every column from the users table?"],
    ["SELECT * FROM users", "SELECT users", "GET * FROM users", "SELECT ALL users"]
  ),
  question(["결과를 특정 열 기준으로 정렬하는 절은?", "Which clause sorts the result by a column?"], ["ORDER BY", "SORT BY", "GROUP BY", "ARRANGE BY"]),
  question(["반환되는 행 수를 제한하는 절은?", "Which clause caps the number of rows returned?"], ["LIMIT", "TOP BY", "COUNT", "RANGE"]),
  question(
    ["값이 비어 있는 행을 찾는 올바른 조건은?", "Which condition correctly finds rows with an empty value?"],
    ["WHERE email IS NULL", "WHERE email = NULL", "WHERE email == NULL", "WHERE email EQUALS NULL"]
  ),
  question(
    ["문자열 일부로 검색할 때 쓰는 연산자는?", "Which operator searches by part of a string?"],
    ["LIKE", "MATCH", "CONTAINS", "SEARCH"]
  ),
  question(
    ["여러 값 중 하나와 일치하는 행을 찾는 연산자는?", "Which operator matches any value in a list?"],
    ["IN", "ANY OF", "EITHER", "SOME"]
  ),
  question(
    ["행의 개수를 세는 집계 함수는?", "Which aggregate function counts rows?"],
    ["COUNT()", "SUM()", "TOTAL()", "NUMBER()"]
  ),
  question(
    ["SELECT * 대신 필요한 열만 적는 것이 좋은 이유는?", "Why name only the columns you need instead of SELECT *?"],
    [["전송량이 줄고 스키마가 바뀌어도 덜 깨진다", "Less data moves and schema changes break less"], ["문법이 더 짧아진다", "The syntax gets shorter"], ["인덱스가 자동으로 생성된다", "Indexes are created automatically"], ["트랜잭션이 필요 없어진다", "Transactions become unnecessary"]]
  ),
];

/** LV.2 table-keeper — Primary key */
const tableKeeperQuiz: readonly QuizQuestion[] = [
  question(
    ["기본 키(primary key)의 역할은?", "What is the role of a primary key?"],
    [["테이블의 각 행을 고유하게 식별한다", "It uniquely identifies each row in a table"], ["행을 정렬된 순서로 유지한다", "It keeps rows in sorted order"], ["데이터를 압축한다", "It compresses data"], ["조회 결과를 캐시한다", "It caches query results"]]
  ),
  question(
    ["기본 키 열이 가질 수 없는 값은?", "Which value can a primary key column never hold?"],
    ["NULL", "0", ["빈 문자열", "An empty string"], ["음수", "A negative number"]]
  ),
  question(
    ["한 테이블에 기본 키는 몇 개까지 둘 수 있나?", "How many primary keys can one table have?"],
    [["하나 (여러 열을 묶은 복합 키도 하나로 센다)", "One, counting a multi-column composite key as one"], ["열마다 하나씩", "One per column"], ["최대 세 개", "Up to three"], ["제한이 없다", "There is no limit"]]
  ),
  question(
    ["다른 테이블의 기본 키를 참조하는 열은?", "Which column references another table's primary key?"],
    [["외래 키", "A foreign key"], ["후보 키", "A candidate key"], ["인덱스 키", "An index key"], ["정렬 키", "A sort key"]]
  ),
  question(
    ["외래 키 제약이 막아 주는 것은?", "What does a foreign key constraint prevent?"],
    [["존재하지 않는 행을 참조하는 일", "References to rows that do not exist"], ["느린 조회", "Slow queries"], ["중복된 인덱스", "Duplicate indexes"], ["큰 트랜잭션", "Large transactions"]]
  ),
  question(
    ["열 값이 테이블 안에서 겹치지 않게 강제하는 제약은?", "Which constraint forces a column's values to stay distinct?"],
    ["UNIQUE", "DEFAULT", "CHECK", "INDEX"]
  ),
  question(
    ["값이 비어 있으면 안 되는 열에 붙이는 제약은?", "Which constraint forbids an empty value in a column?"],
    ["NOT NULL", "REQUIRED", "MANDATORY", "FILLED"]
  ),
  question(
    ["이메일처럼 바뀔 수 있는 값을 기본 키로 삼으면 안 되는 이유는?", "Why avoid a changeable value such as an email as a primary key?"],
    [["값이 바뀌면 참조하는 모든 곳을 함께 고쳐야 한다", "Changing it forces every reference to change too"], ["문자열은 저장할 수 없기 때문이다", "Strings cannot be stored"], ["이메일은 항상 중복되기 때문이다", "Emails are always duplicated"], ["기본 키는 숫자만 허용되기 때문이다", "Primary keys accept only numbers"]]
  ),
  question(
    ["새 행마다 번호를 자동으로 붙이는 열을 부르는 말은?", "What is a column that numbers each new row automatically called?"],
    [["자동 증가 열", "An auto-increment column"], ["계산 열", "A computed column"], ["파티션 열", "A partition column"], ["집계 열", "An aggregate column"]]
  ),
  question(
    ["테이블 구조를 새로 정의하는 SQL 문장은?", "Which SQL statement defines a new table structure?"],
    ["CREATE TABLE", "MAKE TABLE", "NEW TABLE", "DEFINE TABLE"]
  ),
];

/** LV.3 join-mason — JOIN */
const joinMasonQuiz: readonly QuizQuestion[] = [
  question(
    ["JOIN이 하는 일은?", "What does a JOIN do?"],
    [["관련 키를 기준으로 여러 테이블의 행을 결합한다", "It combines rows from tables using related keys"], ["여러 결과를 세로로 이어 붙인다", "It stacks several results vertically"], ["열을 삭제한다", "It removes columns"], ["행을 정렬한다", "It sorts rows"]]
  ),
  question(
    ["양쪽 모두에 일치하는 행만 남기는 조인은?", "Which join keeps only rows that match on both sides?"],
    ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"]
  ),
  question(
    ["왼쪽 테이블의 행은 모두 남기는 조인은?", "Which join keeps every row from the left table?"],
    ["LEFT JOIN", "INNER JOIN", "CROSS JOIN", "SELF JOIN"]
  ),
  question(
    ["LEFT JOIN에서 오른쪽에 짝이 없을 때 그 열의 값은?", "In a LEFT JOIN, what value appears when the right side has no match?"],
    ["NULL", "0", ["빈 문자열", "An empty string"], ["이전 행의 값", "The previous row's value"]]
  ),
  question(
    ["조인 조건을 적는 절은?", "Which clause states the join condition?"],
    ["ON", "WHERE ONLY", "USING WHEN", "MATCH"]
  ),
  question(
    ["조인 조건 없이 모든 조합을 만드는 조인은?", "Which join produces every combination with no condition?"],
    ["CROSS JOIN", "INNER JOIN", "LEFT JOIN", "NATURAL JOIN"]
  ),
  question(
    ["같은 테이블을 자기 자신과 조인하는 것을 부르는 말은?", "What is joining a table with itself called?"],
    [["셀프 조인", "A self join"], ["역조인", "A reverse join"], ["중첩 조인", "A nested join"], ["재귀 뷰", "A recursive view"]]
  ),
  question(
    ["집계 결과를 그룹으로 묶는 절과 그 결과를 거르는 절은?", "Which clauses group aggregates and then filter those groups?"],
    [["GROUP BY와 HAVING", "GROUP BY and HAVING"], ["GROUP BY와 WHERE", "GROUP BY and WHERE"], ["ORDER BY와 HAVING", "ORDER BY and HAVING"], ["PARTITION과 WHERE", "PARTITION and WHERE"]]
  ),
  question(
    ["두 SELECT 결과를 중복 없이 세로로 합치는 연산자는?", "Which operator stacks two SELECT results without duplicates?"],
    ["UNION", "UNION ALL", "JOIN", "MERGE"]
  ),
  question(
    ["조인 결과의 행 수가 예상보다 폭증했다면 먼저 의심할 것은?", "If a join returns far more rows than expected, what should you suspect first?"],
    [["조인 키가 한쪽에서 중복돼 곱해졌다", "The join key is duplicated on one side, multiplying rows"], ["인덱스가 너무 많다", "There are too many indexes"], ["열 이름이 길다", "The column names are long"], ["트랜잭션이 열려 있다", "A transaction is open"]]
  ),
];

/** LV.4 schema-warden — Index */
const schemaWardenQuiz: readonly QuizQuestion[] = [
  question(
    ["인덱스를 만드는 목적은?", "Why create an index?"],
    [["추가 저장 공간을 써서 특정 조회를 빠르게 한다", "It trades extra storage for faster lookups"], ["데이터를 압축해 용량을 줄인다", "It compresses data to save space"], ["쓰기 성능을 높인다", "It makes writes faster"], ["백업을 자동화한다", "It automates backups"]]
  ),
  question(
    ["인덱스를 무작정 많이 만들면 생기는 부작용은?", "What is the downside of creating too many indexes?"],
    [["INSERT와 UPDATE가 느려지고 저장 공간을 더 쓴다", "Inserts and updates slow down and storage grows"], ["조회가 느려진다", "Reads get slower"], ["기본 키가 사라진다", "The primary key disappears"], ["트랜잭션이 깨진다", "Transactions break"]]
  ),
  question(
    ["대부분의 관계형 데이터베이스가 인덱스에 쓰는 자료 구조는?", "Which data structure do most relational databases use for indexes?"],
    ["B-tree", ["연결 리스트", "A linked list"], ["스택", "A stack"], ["큐", "A queue"]]
  ),
  question(
    ["인덱스가 걸린 열에 WHERE LIKE '%검색어'를 쓰면?", "What happens with WHERE LIKE '%term' on an indexed column?"],
    [["앞이 열려 있어 인덱스를 제대로 쓰지 못한다", "The open prefix prevents the index from being used well"], ["항상 인덱스를 완전히 활용한다", "The index is always fully used"], ["인덱스가 자동으로 재생성된다", "The index is rebuilt automatically"], ["문법 오류가 발생한다", "It is a syntax error"]]
  ),
  question(
    ["쿼리가 어떤 실행 계획으로 도는지 확인하는 명령은?", "Which command shows the plan a query will run with?"],
    ["EXPLAIN", "DESCRIBE PLAN", "SHOW QUERY", "ANALYZE ONLY"]
  ),
  question(
    ["여러 열을 묶어 만든 인덱스에서 중요한 것은?", "What matters most in a multi-column index?"],
    [["열의 순서 — 앞쪽 열부터 조건에 써야 효과가 있다", "Column order — conditions must use the leading columns"], ["열 이름의 길이", "The length of the column names"], ["열의 데이터 타입이 모두 같아야 한다", "Every column must share one data type"], ["열 개수가 홀수여야 한다", "The column count must be odd"]]
  ),
  question(
    ["인덱스만 읽고 테이블을 읽지 않아도 되는 상황을 부르는 말은?", "What is it called when a query is answered from the index alone?"],
    [["커버링 인덱스", "A covering index"], ["부분 인덱스", "A partial index"], ["클러스터 키", "A cluster key"], ["머티리얼라이즈드 뷰", "A materialized view"]]
  ),
  question(
    ["인덱스를 추가하기 가장 좋은 열은?", "Which column is the best candidate for an index?"],
    [["조회 조건과 조인에 자주 쓰이는 열", "A column used often in filters and joins"], ["값이 거의 모두 같은 열", "A column where nearly every value is identical"], ["거의 쓰이지 않는 열", "A column almost never queried"], ["가장 긴 텍스트가 담긴 열", "The column holding the longest text"]]
  ),
  question(
    ["조회 조건 열에 함수를 씌우면 흔히 벌어지는 일은?", "What commonly happens when you wrap a filtered column in a function?"],
    [["인덱스를 타지 못하고 전체 탐색이 된다", "The index is skipped and a full scan runs"], ["인덱스 효과가 두 배가 된다", "The index becomes twice as effective"], ["쿼리가 자동으로 캐시된다", "The query is cached automatically"], ["실행 계획이 고정된다", "The execution plan is pinned"]]
  ),
  question(
    ["느린 쿼리를 개선할 때 가장 먼저 할 일은?", "What is the first step in fixing a slow query?"],
    [["실행 계획을 확인해 병목을 찾는다", "Read the execution plan to find the bottleneck"], ["모든 열에 인덱스를 건다", "Index every column"], ["서버를 재시작한다", "Restart the server"], ["테이블을 나눠 복사한다", "Copy the table into pieces"]]
  ),
];

/** LV.5 transaction-archivist — Transaction */
const transactionArchivistQuiz: readonly QuizQuestion[] = [
  question(
    ["트랜잭션이 보장하는 것은?", "What does a transaction guarantee?"],
    [["여러 변경이 전부 반영되거나 전부 취소된다", "Either every change applies or none of them do"], ["쿼리가 항상 빨라진다", "Queries always run faster"], ["데이터가 자동으로 백업된다", "Data is backed up automatically"], ["인덱스가 자동 생성된다", "Indexes are created automatically"]]
  ),
  question(
    ["ACID의 A가 뜻하는 것은?", "What does the A in ACID stand for?"],
    [["원자성", "Atomicity"], ["가용성", "Availability"], ["정확성", "Accuracy"], ["비동기성", "Asynchrony"]]
  ),
  question(["트랜잭션의 변경을 확정하는 명령은?", "Which command makes a transaction's changes permanent?"], ["COMMIT", "SAVE", "APPLY", "FLUSH"]),
  question(["트랜잭션의 변경을 모두 되돌리는 명령은?", "Which command undoes all of a transaction's changes?"], ["ROLLBACK", "UNDO", "REVERT", "CANCEL"]),
  question(
    ["커밋되지 않은 다른 트랜잭션의 값을 읽어 버리는 문제는?", "What problem is reading another transaction's uncommitted value?"],
    [["더티 리드", "A dirty read"], ["팬텀 리드", "A phantom read"], ["교착 상태", "A deadlock"], ["락 에스컬레이션", "Lock escalation"]]
  ),
  question(
    ["같은 조건으로 두 번 조회했는데 행 수가 달라지는 문제는?", "What problem is the same filter returning a different row count twice?"],
    [["팬텀 리드", "A phantom read"], ["더티 리드", "A dirty read"], ["손실 갱신", "A lost update"], ["스냅숏 충돌", "A snapshot conflict"]]
  ),
  question(
    ["두 트랜잭션이 서로의 락을 기다리며 멈추는 상황은?", "What is it called when two transactions wait on each other's locks forever?"],
    [["교착 상태", "A deadlock"], ["타임아웃", "A timeout"], ["롤백", "A rollback"], ["체크포인트", "A checkpoint"]]
  ),
  question(
    ["격리 수준을 가장 엄격하게 설정한 것은?", "Which is the strictest isolation level?"],
    ["SERIALIZABLE", "READ COMMITTED", "READ UNCOMMITTED", "REPEATABLE READ"]
  ),
  question(
    ["격리 수준을 높였을 때의 일반적인 대가는?", "What is the usual cost of raising the isolation level?"],
    [["동시 처리량이 줄고 대기가 늘어난다", "Concurrency drops and waiting increases"], ["데이터가 손상된다", "Data becomes corrupted"], ["디스크 용량이 늘어난다", "Disk usage grows"], ["인덱스가 무효화된다", "Indexes are invalidated"]]
  ),
  question(
    ["트랜잭션을 가능한 짧게 유지해야 하는 이유는?", "Why keep a transaction as short as possible?"],
    [["락을 오래 쥐면 다른 작업이 줄줄이 대기한다", "Holding locks long makes other work queue up behind it"], ["긴 트랜잭션은 문법 오류가 된다", "Long transactions are a syntax error"], ["커밋이 불가능해진다", "Committing becomes impossible"], ["인덱스가 삭제된다", "Indexes get dropped"]]
  ),
];

const sqlQuiz: readonly (readonly QuizQuestion[])[] = [
  queryMoleQuiz,
  tableKeeperQuiz,
  joinMasonQuiz,
  schemaWardenQuiz,
  transactionArchivistQuiz,
];

export default sqlQuiz;
