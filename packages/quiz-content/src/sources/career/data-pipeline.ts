import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 droplet-runner — Extract */
const dropletRunnerQuiz: readonly QuizQuestion[] = [
  question(
    ["추출(Extract) 단계가 하는 일은?", "What does the extract step do?"],
    [["원천 시스템에서 데이터를 읽어 온다", "It reads data from source systems"], ["데이터를 정제한다", "It cleans the data"], ["결과를 목적지에 적재한다", "It loads results into a destination"], ["대시보드를 만든다", "It builds dashboards"]]
  ),
  question(
    ["ETL이 뜻하는 순서는?", "What order does ETL describe?"],
    [["추출 → 변환 → 적재", "Extract → transform → load"], ["적재 → 추출 → 변환", "Load → extract → transform"], ["변환 → 적재 → 추출", "Transform → load → extract"], ["추출 → 적재 → 삭제", "Extract → load → delete"]]
  ),
  question(
    ["ELT가 ETL과 다른 점은?", "How does ELT differ from ETL?"],
    [["먼저 적재한 뒤 목적지에서 변환한다", "It loads first and transforms inside the destination"], ["변환을 하지 않는다", "It never transforms"], ["추출을 생략한다", "It skips extraction"], ["둘은 같은 말이다", "They mean the same thing"]]
  ),
  question(
    ["매번 전체가 아니라 바뀐 부분만 가져오는 방식은?", "What is fetching only what changed instead of everything called?"],
    [["증분 추출", "Incremental extraction"], ["전체 적재", "A full load"], ["스냅숏 복제", "Snapshot replication"], ["샤딩", "Sharding"]]
  ),
  question(
    ["증분 추출을 하려면 원천에 필요한 것은?", "What does the source need for incremental extraction to work?"],
    [["변경 시각이나 증가하는 키 같은 기준 값", "A watermark such as an updated timestamp or increasing key"], ["더 많은 저장 공간", "More storage"], ["더 빠른 네트워크", "A faster network"], ["전체 테이블 잠금", "A full table lock"]]
  ),
  question(
    ["운영 데이터베이스에서 직접 대량 추출할 때 주의할 점은?", "What deserves care when extracting in bulk from a production database?"],
    [["서비스 부하를 주므로 복제본이나 한가한 시간대를 쓴다", "It loads the service, so use a replica or a quiet window"], ["데이터가 손상된다", "The data becomes corrupted"], ["스키마가 바뀐다", "The schema changes"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["원천의 변경 이벤트를 실시간으로 잡아내는 방식은?", "What captures a source's change events in near real time?"],
    ["CDC", "OLAP", "RBAC", "SLA"]
  ),
  question(
    ["API에서 대량 데이터를 가져올 때 필요한 처리는?", "What must you handle when pulling large data from an API?"],
    [["페이지네이션과 요청 제한", "Pagination and rate limits"], ["스키마 삭제", "Dropping the schema"], ["색상 매핑", "Color mapping"], ["대시보드 설계", "Dashboard design"]]
  ),
  question(
    ["추출 작업이 중간에 실패했을 때 안전한 재실행 조건은?", "What makes rerunning a failed extraction safe?"],
    [["같은 구간을 다시 처리해도 결과가 중복되지 않아야 한다", "Reprocessing the same window must not duplicate results"], ["항상 처음부터 다시 받아야 한다", "It must always restart from the very beginning"], ["실패 기록을 지워야 한다", "The failure record must be erased"], ["재실행은 불가능하다", "Rerunning is impossible"]]
  ),
  question(
    ["원천 데이터를 가공 전 원본 그대로 보관하는 이유는?", "Why keep raw source data before any processing?"],
    [["변환 로직이 바뀌어도 다시 계산할 수 있다", "You can recompute when the transformation logic changes"], ["저장 비용을 줄이기 위해서다", "To reduce storage cost"], ["처리가 빨라지기 때문이다", "It makes processing faster"], ["품질 검사가 필요 없어지기 때문이다", "It removes the need for quality checks"]]
  ),
];

/** LV.2 stream-courier — Transform */
const streamCourierQuiz: readonly QuizQuestion[] = [
  question(
    ["변환(Transform) 단계가 하는 일은?", "What does the transform step do?"],
    [["데이터를 정제하고 분석 가능한 형태로 바꾼다", "It cleans and reshapes data into an analyzable form"], ["원천에서 데이터를 읽는다", "It reads data from the source"], ["목적지에 적재한다", "It writes into the destination"], ["대시보드를 배포한다", "It publishes the dashboard"]]
  ),
  question(
    ["여러 원천의 날짜 형식이 제각각일 때 변환 단계에서 할 일은?", "What does the transform step do when sources use different date formats?"],
    [["하나의 표준 형식으로 정규화한다", "Normalize them into one standard format"], ["가장 많은 형식만 남긴다", "Keep only the most common format"], ["날짜 열을 삭제한다", "Drop the date column"], ["그대로 둔다", "Leave them as they are"]]
  ),
  question(
    ["같은 대상이 여러 행으로 중복될 때 필요한 처리는?", "What is needed when one entity appears as several duplicate rows?"],
    [["중복 제거", "Deduplication"], ["파티셔닝", "Partitioning"], ["압축", "Compression"], ["인덱싱", "Indexing"]]
  ),
  question(
    ["여러 원천의 열 이름과 의미를 맞추는 작업을 부르는 말은?", "What is aligning column names and meanings across sources called?"],
    [["스키마 매핑", "Schema mapping"], ["샤딩", "Sharding"], ["캐싱", "Caching"], ["롤백", "Rollback"]]
  ),
  question(
    ["변환 로직을 SQL이나 코드로 버전 관리하면 좋은 점은?", "What is gained by version-controlling transformation logic?"],
    [["무엇이 왜 바뀌었는지 추적하고 리뷰할 수 있다", "Changes are traceable and reviewable"], ["처리가 항상 빨라진다", "Processing always gets faster"], ["저장 비용이 줄어든다", "Storage cost drops"], ["품질 검사가 필요 없어진다", "Quality checks become unnecessary"]]
  ),
  question(
    ["집계 결과가 원본과 맞는지 확인하는 방법은?", "How do you confirm an aggregate matches its source?"],
    [["행 수와 합계 같은 대조 검사를 자동화한다", "Automate reconciliation checks such as row counts and totals"], ["눈으로 몇 줄만 본다", "Eyeball a few rows"], ["결과를 신뢰한다", "Simply trust the result"], ["원본을 삭제한다", "Delete the source"]]
  ),
  question(
    ["변환 단계에서 결측값을 다루는 바람직한 방법은?", "What is a sound way to handle missing values in transformation?"],
    [["의미를 판단해 채우거나 명시적으로 표시한다", "Decide what it means, then fill it or mark it explicitly"], ["항상 0으로 바꾼다", "Always replace it with zero"], ["행을 무조건 삭제한다", "Always drop the row"], ["무시한다", "Ignore it"]]
  ),
  question(
    ["과거 값을 보존하며 이력을 관리하는 차원 테이블 방식은?", "Which dimension approach preserves historical values?"],
    [["천천히 변하는 차원", "A slowly changing dimension"], ["팩트 테이블", "A fact table"], ["인덱스 뷰", "An indexed view"], ["임시 테이블", "A temporary table"]]
  ),
  question(
    ["변환 결과를 테스트해야 하는 이유는?", "Why test transformation output?"],
    [["잘못된 데이터는 조용히 퍼져 분석 결론을 틀리게 한다", "Bad data spreads silently and corrupts the conclusions drawn from it"], ["처리 속도를 재기 위해서다", "To measure processing speed"], ["저장 비용을 알기 위해서다", "To learn the storage cost"], ["스키마를 만들기 위해서다", "To create the schema"]]
  ),
  question(
    ["여러 단계 변환에서 중간 결과를 남기는 이유는?", "Why materialize intermediate results in a multi-step transformation?"],
    [["문제 지점을 짚어 내고 다시 계산하기 쉬워진다", "It pinpoints where things went wrong and makes recomputation easy"], ["저장 공간을 아낀다", "It saves storage"], ["보안이 강해진다", "It improves security"], ["원본이 필요 없어진다", "It removes the need for raw data"]]
  ),
];

/** LV.3 transform-engineer — Load */
const transformEngineerQuiz: readonly QuizQuestion[] = [
  question(
    ["적재(Load) 단계가 하는 일은?", "What does the load step do?"],
    [["처리한 데이터를 목적 저장소에 쓴다", "It writes processed data into the destination store"], ["원천에서 읽어 온다", "It reads from the source"], ["데이터를 정제한다", "It cleans the data"], ["알림을 보낸다", "It sends alerts"]]
  ),
  question(
    ["전체 적재와 증분 적재의 차이는?", "How does a full load differ from an incremental load?"],
    [["전체는 매번 다시 쓰고 증분은 바뀐 부분만 쓴다", "A full load rewrites everything; an incremental load writes only changes"], ["증분이 항상 더 정확하다", "Incremental is always more accurate"], ["전체는 실패하지 않는다", "A full load never fails"], ["둘은 같다", "They are the same"]]
  ),
  question(
    ["같은 작업을 두 번 실행해도 결과가 같아야 하는 성질은?", "What property requires the same result when a job runs twice?"],
    [["멱등성", "Idempotence"], ["원자성", "Atomicity"], ["병렬성", "Parallelism"], ["지속성", "Durability"]]
  ),
  question(
    ["적재 작업을 멱등하게 만드는 흔한 방법은?", "What commonly makes a load idempotent?"],
    [["키 기준 upsert나 파티션 단위 덮어쓰기", "Key-based upsert, or overwriting a whole partition"], ["매번 append만 한다", "Appending every time"], ["중복을 허용한다", "Allowing duplicates"], ["로그를 지운다", "Clearing the logs"]]
  ),
  question(
    ["큰 테이블을 날짜 등으로 나눠 저장하는 기법은?", "Which technique splits a large table by a column such as date?"],
    [["파티셔닝", "Partitioning"], ["정규화", "Normalization"], ["인덱싱", "Indexing"], ["캐싱", "Caching"]]
  ),
  question(
    ["분석용 저장소가 열 기반 형식을 쓰는 이유는?", "Why do analytical stores use columnar formats?"],
    [["필요한 열만 읽어 집계가 빨라진다", "Only the needed columns are read, so aggregation is faster"], ["행 단위 수정이 빨라진다", "Row-level updates get faster"], ["용량이 항상 커진다", "Storage always grows"], ["스키마가 필요 없어진다", "No schema is needed"]]
  ),
  question(
    ["적재 도중 실패했을 때 부분 결과가 남지 않게 하려면?", "How do you keep partial results out of the destination on failure?"],
    [["임시 위치에 쓰고 성공 시 원자적으로 교체한다", "Write to a staging location and swap atomically on success"], ["직접 목적지에 조금씩 쓴다", "Write directly into the destination bit by bit"], ["실패를 무시한다", "Ignore the failure"], ["데이터를 삭제한다", "Delete the data"]]
  ),
  question(
    ["다운스트림 소비자가 있는 테이블의 스키마를 바꿀 때 필요한 것은?", "What is required when changing the schema of a table with downstream consumers?"],
    [["호환성을 지키며 사전에 알리고 이행 기간을 둔다", "Preserve compatibility, announce it in advance and allow a migration window"], ["즉시 열을 삭제한다", "Drop the column immediately"], ["알리지 않고 바꾼다", "Change it without telling anyone"], ["테이블을 새로 만들고 방치한다", "Create a new table and abandon the old one"]]
  ),
  question(
    ["적재량이 급증했을 때 먼저 확인할 것은?", "What should you check first when load volume spikes?"],
    [["원천 변경이나 중복 적재가 없는지", "Whether the source changed or data is being loaded twice"], ["대시보드 색상", "The dashboard colors"], ["팀의 인원 수", "The size of the team"], ["파일 이름 규칙", "The file naming convention"]]
  ),
  question(
    ["데이터 웨어하우스와 데이터 레이크의 차이는?", "How does a data warehouse differ from a data lake?"],
    [["웨어하우스는 정형 분석에, 레이크는 원본 다양성 보관에 강하다", "A warehouse suits structured analytics; a lake keeps diverse raw data"], ["레이크는 SQL을 쓸 수 없다", "A lake cannot be queried with SQL"], ["웨어하우스는 저장이 불가능하다", "A warehouse cannot store data"], ["둘은 같은 말이다", "They mean the same thing"]]
  ),
];

/** LV.4 pipeline-conductor — Batch/Stream */
const pipelineConductorQuiz: readonly QuizQuestion[] = [
  question(
    ["배치 처리의 특징은?", "What characterizes batch processing?"],
    [["일정 주기로 모아 둔 데이터를 한 번에 처리한다", "It processes accumulated data on a schedule, all at once"], ["도착 즉시 한 건씩 처리한다", "It handles each record the moment it arrives"], ["데이터를 저장하지 않는다", "It never stores data"], ["항상 실시간이다", "It is always real time"]]
  ),
  question(
    ["스트림 처리의 특징은?", "What characterizes stream processing?"],
    [["연속된 이벤트를 도착하는 대로 처리한다", "It processes a continuous flow of events as they arrive"], ["하루에 한 번만 실행된다", "It runs once a day"], ["데이터를 모아 두었다 처리한다", "It waits and processes in bulk"], ["변환을 하지 않는다", "It performs no transformation"]]
  ),
  question(
    ["배치가 스트림보다 알맞은 경우는?", "When does batch fit better than streaming?"],
    [["일 단위 집계처럼 지연이 허용되는 작업", "Work that tolerates delay, such as a daily aggregate"], ["실시간 이상 탐지", "Real-time anomaly detection"], ["즉시 알림 발송", "Instant notification delivery"], ["실시간 대시보드", "A live dashboard"]]
  ),
  question(
    ["스트림 처리에서 일정 시간 구간으로 묶어 집계하는 개념은?", "What groups streaming events into a time range for aggregation?"],
    [["윈도우", "A window"], ["파티션", "A partition"], ["체크포인트", "A checkpoint"], ["오프셋", "An offset"]]
  ),
  question(
    ["이벤트가 실제 발생한 시각을 기준으로 처리하는 방식은?", "Which approach processes by when an event actually happened?"],
    [["이벤트 시간 기준", "Event time"], ["처리 시간 기준", "Processing time"], ["적재 시간 기준", "Ingestion time"], ["시스템 시간 기준", "System time"]]
  ),
  question(
    ["네트워크 지연으로 늦게 도착한 이벤트를 부르는 말은?", "What is an event that arrives after its window called?"],
    [["지연 도착 데이터", "Late-arriving data"], ["중복 데이터", "Duplicate data"], ["결측 데이터", "Missing data"], ["샘플 데이터", "Sample data"]]
  ),
  question(
    ["스트림에서 처리 위치를 기록해 재시작에 대비하는 값은?", "Which value records a stream consumer's position for restart?"],
    [["오프셋", "An offset"], ["파티션 키", "The partition key"], ["윈도우 크기", "The window size"], ["보존 기간", "The retention period"]]
  ),
  question(
    ["최소 한 번 전달(at-least-once)이 뜻하는 것은?", "What does at-least-once delivery mean?"],
    [["메시지가 유실되지는 않지만 중복될 수 있다", "Messages are never lost but may be delivered more than once"], ["메시지가 정확히 한 번만 도착한다", "Each message arrives exactly once"], ["메시지가 유실될 수 있다", "Messages may be lost"], ["메시지가 도착하지 않는다", "Messages never arrive"]]
  ),
  question(
    ["최소 한 번 전달 환경에서 소비자가 갖춰야 할 성질은?", "What must a consumer provide under at-least-once delivery?"],
    [["중복 처리를 견디는 멱등성", "Idempotence, so duplicates do no harm"], ["더 빠른 처리 속도", "Higher throughput"], ["더 큰 저장 공간", "More storage"], ["더 짧은 보존 기간", "Shorter retention"]]
  ),
  question(
    ["배치와 스트림을 함께 운영할 때 흔한 요구는?", "What is a common requirement when running batch and streaming together?"],
    [["두 경로의 결과가 결국 같은 값으로 수렴해야 한다", "Both paths must eventually converge on the same values"], ["한쪽 결과만 쓰고 다른 쪽은 버린다", "Use one result and discard the other"], ["두 결과가 달라도 상관없다", "It is fine for them to disagree"], ["스트림을 먼저 중단한다", "Stop the stream first"]]
  ),
];

/** LV.5 flow-architect — Data quality */
const flowArchitectQuiz: readonly QuizQuestion[] = [
  question(
    ["데이터 품질 검사가 확인하는 것은?", "What does a data quality check verify?"],
    [["정확성, 완전성, 유효성 같은 규칙을 만족하는지", "That rules such as accuracy, completeness and validity hold"], ["처리 속도", "Processing speed"], ["저장 비용", "Storage cost"], ["대시보드 색상", "Dashboard colors"]]
  ),
  question(
    ["필수 열에 빈 값이 없는지 보는 검사는?", "Which check confirms a required column has no empty values?"],
    [["완전성 검사", "A completeness check"], ["고유성 검사", "A uniqueness check"], ["신선도 검사", "A freshness check"], ["범위 검사", "A range check"]]
  ),
  question(
    ["키 값이 중복되지 않는지 보는 검사는?", "Which check confirms a key value never repeats?"],
    [["고유성 검사", "A uniqueness check"], ["완전성 검사", "A completeness check"], ["형식 검사", "A format check"], ["참조 검사", "A referential check"]]
  ),
  question(
    ["데이터가 기대한 시각까지 도착했는지 보는 검사는?", "Which check confirms data arrived by the expected time?"],
    [["신선도 검사", "A freshness check"], ["범위 검사", "A range check"], ["형식 검사", "A format check"], ["고유성 검사", "A uniqueness check"]]
  ),
  question(
    ["품질 검사가 실패했을 때 바람직한 기본 동작은?", "What should happen by default when a quality check fails?"],
    [["하류 소비를 막고 담당자에게 알린다", "Block downstream consumption and notify an owner"], ["조용히 통과시킨다", "Let it pass silently"], ["데이터를 삭제한다", "Delete the data"], ["검사를 끈다", "Turn the check off"]]
  ),
  question(
    ["데이터가 어디서 와서 어떻게 변형됐는지 추적하는 것은?", "What traces where data came from and how it was transformed?"],
    [["데이터 리니지", "Data lineage"], ["데이터 카탈로그만", "A data catalog alone"], ["파티셔닝", "Partitioning"], ["샤딩", "Sharding"]]
  ),
  question(
    ["리니지를 알아 두면 좋은 이유는?", "Why is lineage worth maintaining?"],
    [["문제가 생겼을 때 영향 범위와 원인을 빠르게 짚는다", "It pinpoints the blast radius and the cause when something breaks"], ["저장 비용이 줄어든다", "It reduces storage cost"], ["처리가 빨라진다", "It speeds up processing"], ["스키마가 필요 없어진다", "It removes the need for a schema"]]
  ),
  question(
    ["데이터 계약(data contract)이 정하는 것은?", "What does a data contract define?"],
    [["생산자가 보장하는 스키마와 품질 기준", "The schema and quality guarantees the producer commits to"], ["저장소의 물리 구조", "The physical storage layout"], ["대시보드 디자인", "The dashboard design"], ["팀의 인원 구성", "The team's staffing"]]
  ),
  question(
    ["각 데이터셋에 담당자를 두는 이유는?", "Why assign an owner to each dataset?"],
    [["문제와 변경에 책임지고 대응할 사람이 분명해진다", "There is a clear person accountable for problems and changes"], ["저장 비용이 줄어든다", "Storage cost drops"], ["쿼리가 빨라진다", "Queries get faster"], ["검사가 필요 없어진다", "Checks become unnecessary"]]
  ),
  question(
    ["잘못된 데이터가 이미 하류로 퍼졌을 때 필요한 것은?", "What is needed once bad data has already spread downstream?"],
    [["영향 범위를 파악해 재처리하고 소비자에게 알린다", "Identify the affected scope, reprocess it and tell the consumers"], ["원본만 조용히 고친다", "Quietly fix the source only"], ["기록을 삭제한다", "Delete the records"], ["다음 배치를 기다린다", "Just wait for the next batch"]]
  ),
];

const dataPipelineQuiz: readonly (readonly QuizQuestion[])[] = [
  dropletRunnerQuiz,
  streamCourierQuiz,
  transformEngineerQuiz,
  pipelineConductorQuiz,
  flowArchitectQuiz,
];

export default dataPipelineQuiz;
