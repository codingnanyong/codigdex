import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { OPEN_SOURCE_CATALOG, OPEN_SOURCE_KIND_LABELS, type OpenSourceKind } from "@codigdex/game-content/domain/openSourceCatalog";

type Pair = readonly [ko: string, en: string];
type Lesson = { actions: readonly Pair[]; situations: readonly Pair[] };
const lesson = (actions: readonly Pair[], situations: readonly Pair[]): Lesson => ({ actions, situations });

/** Four distinct situations per tool, in action order. Roles, topics and source links
 * are shared with the catalog. Facts are grounded in the linked official docs;
 * these are authored game situations, not quotations or version-specific syntax. */
const lessons: Record<string, Lesson> = {
  hadoop: lesson([
    ["HDFS에 분산 저장", "Store across HDFS"], ["YARN으로 자원 조율", "Coordinate resources with YARN"], ["MapReduce로 병렬 처리", "Process in parallel with MapReduce"], ["장애를 고려한 여러 노드 구성", "Use multiple nodes with failure handling"],
  ], [
    ["하둡 숲의 큰 씨앗 파일을 여러 기계에 보관하려면?", "How should the Hadoop forest store a large seed file across machines?"], ["여러 작업이 같은 클러스터의 메모리를 두고 다투면?", "Several jobs compete for the Hadoop cluster's memory. Which responsibility helps?"], ["씨앗을 종류별로 나누고 합쳐 대량 집계하려면?", "How can Hadoop divide and combine seeds for a large aggregate?"], ["기계 한 대의 고장에도 숲의 일을 이어 가려면 어떤 구성이 필요할까?", "What setup helps the forest continue when one machine fails?"],
  ]),
  hdfs: lesson([
    ["블록 복제본에서 읽기", "Read a block replica"], ["NameNode의 메타데이터 확인", "Inspect NameNode metadata"], ["DataNode에 블록 저장", "Store blocks on DataNodes"], ["복제 상태를 복구", "Restore replication health"],
  ], [
    ["HDFS의 한 블록을 가진 노드가 멈췄다. 다른 복제본이 있다면 읽기 경로는?", "An HDFS block's node stops, but another replica exists. How can reading continue?"], ["HDFS 파일의 블록 위치를 찾는 역할은?", "Which HDFS responsibility helps locate a file's blocks?"], ["HDFS에서 실제 파일 블록을 맡길 곳은?", "Where should actual HDFS file blocks live?"], ["HDFS 복제본 수가 목표보다 줄었다. 다음 조치는?", "HDFS has fewer replicas than configured. What needs attention?"],
  ]),
  yarn: lesson([
    ["ResourceManager의 자원 할당", "Resource allocation by ResourceManager"], ["NodeManager의 노드 자원 관리", "Node resource management by NodeManager"], ["ApplicationMaster의 작업 조율", "Application coordination by ApplicationMaster"], ["컨테이너의 자원 한도 확인", "Inspect container resource limits"],
  ], [
    ["YARN 클러스터 전체의 작업 자원을 배분하는 역할은?", "Which YARN responsibility allocates resources across the cluster?"], ["YARN의 개별 기계에서 실행 자원을 감시하려면?", "Which YARN responsibility monitors resources on one machine?"], ["YARN에서 특정 애플리케이션의 실행을 조율하는 역할은?", "Which YARN responsibility coordinates one application's execution?"], ["YARN 작업이 받은 메모리보다 더 쓰려 한다. 무엇을 점검할까?", "A YARN task exceeds its allocated memory. What should be checked?"],
  ]),
  mapreduce: lesson([
    ["Map에서 키·값으로 분류", "Emit key-value pairs in Map"], ["Shuffle에서 같은 키 모으기", "Group matching keys in Shuffle"], ["Reduce에서 키별 집계", "Aggregate each key in Reduce"], ["실패한 작업 재실행", "Re-execute failed tasks"],
  ], [
    ["MapReduce에서 각 씨앗을 종류와 개수로 바꾸는 단계는?", "Which MapReduce step emits a seed type and count from each input?"], ["MapReduce에서 같은 종류의 씨앗을 한곳으로 보내는 단계는?", "Which MapReduce step sends matching seed types to the same group?"], ["MapReduce에서 모인 종류별 개수를 합치는 단계는?", "Which MapReduce step totals each grouped seed type?"], ["MapReduce 처리 중 한 작업이 고장 났다. 정상 작업까지 모두 버리는 대신?", "One MapReduce task fails. What recovery avoids discarding all successful work?"],
  ]),
  hive: lesson([
    ["SQL로 분석", "Analyze with SQL"], ["메타스토어 확인", "Inspect the metastore"], ["파티션 조건으로 범위 줄이기", "Narrow scans with partition filters"], ["집계와 GROUP BY 사용", "Use aggregation and GROUP BY"],
  ], [
    ["Hive의 분산 저장 자료를 표 형태의 질의로 읽으려면?", "How can Hive query distributed data as tables?"], ["Hive 테이블의 열과 저장 위치 정의를 찾으려면?", "Where should Hive table columns and storage definitions be checked?"], ["Hive에서 날짜별로 나눈 자료 중 오늘만 읽으려면?", "How can Hive limit reading to today's partitioned records?"], ["Hive에서 지역별 수확 합계를 얻으려면?", "How can Hive compute harvest totals per region?"],
  ]),
  hbase: lesson([
    ["행 키로 조회", "Look up by row key"], ["컬럼 패밀리로 열 묶기", "Group columns into column families"], ["리전의 범위 확인", "Inspect region key ranges"], ["핫스폿을 줄이는 키 설계", "Design keys to reduce hotspots"],
  ], [
    ["HBase에서 특정 주문 한 건을 직접 찾는 기본 식별자는?", "What identifies a specific order for a direct HBase lookup?"], ["HBase에서 관련 열을 저장 단위로 묶는 개념은?", "Which HBase concept groups related columns for storage?"], ["HBase 테이블의 행 키 구간이 어느 서버에 배치됐는지 보려면?", "What should be inspected to locate an HBase table's key range?"], ["HBase의 증가하는 행 키 때문에 한곳에 쓰기가 몰린다. 해결 방향은?", "Increasing HBase keys concentrate writes in one place. What design needs work?"],
  ]),
  zookeeper: lesson([
    ["작은 조정 메타데이터 저장", "Store small coordination metadata"], ["Watch로 변경 통지 받기", "Receive change notifications through watches"], ["임시 노드의 세션 연결 확인", "Check the session behind ephemeral nodes"], ["리더 선출 절차 조정", "Coordinate a leader-election recipe"],
  ], [
    ["ZooKeeper에 대용량 영상 대신 맡기기 적합한 자료는?", "What belongs in ZooKeeper instead of large video files?"], ["ZooKeeper 노드의 변경을 알아차리고 다시 상태를 읽으려면?", "How can a ZooKeeper client notice a node change and read state again?"], ["ZooKeeper의 임시 노드가 사라졌다. 무엇과 연결된 생명주기를 볼까?", "A ZooKeeper ephemeral node disappears. Which lifecycle should be checked?"], ["ZooKeeper를 이용해 여러 후보 중 대표 하나를 정하려면?", "What coordination pattern selects one representative using ZooKeeper?"],
  ]),
  avro: lesson([
    ["스키마로 직렬화", "Serialize using a schema"], ["읽기·쓰기 스키마 호환성 검사", "Check reader-writer schema compatibility"], ["새 필드의 기본값 검토", "Review defaults for new fields"], ["바이트와 스키마를 함께 해석", "Interpret bytes with their schema"],
  ], [
    ["Avro에서 레코드 구조를 약속하며 바이트로 바꾸려면?", "How does Avro encode records under an agreed structure?"], ["Avro 생산자와 소비자의 구조가 달라졌다. 먼저 확인할 것은?", "Avro producer and consumer structures differ. What must be checked?"], ["Avro의 옛 자료를 새 읽기 스키마로 읽을 때 추가 필드를 다루려면?", "What should be reviewed for an added field when an Avro reader reads old data?"], ["Avro 바이트만 보고 열 이름을 추측하는 대신 올바른 읽기 방법은?", "Instead of guessing field names from Avro bytes, what is needed?"],
  ]),
  parquet: lesson([
    ["필요한 열만 읽기", "Read only needed columns"], ["같은 열의 값들을 압축", "Compress values within columns"], ["행 그룹 통계로 건너뛰기", "Skip row groups using statistics"], ["열 지향 파일로 저장", "Store as a column-oriented file"],
  ], [
    ["Parquet의 열 100개 중 가격 1개만 합산한다. 읽기 전략은?", "A Parquet query sums one price column out of 100. What read strategy helps?"], ["Parquet에서 비슷한 형태의 값을 묶어 용량을 줄이는 이점은?", "Which Parquet benefit reduces size by grouping similarly shaped values?"], ["Parquet에서 조건에 맞지 않는 구간을 통계로 제외하려면?", "How can Parquet avoid scanning ranges excluded by available statistics?"], ["Parquet는 실행 중인 데이터베이스 서버가 아니라 어떤 형태일까?", "What form does Parquet take rather than a running database server?"],
  ]),
  airflow: lesson([
    ["DAG 의존성으로 순서 지정", "Order tasks through DAG dependencies"], ["실패한 작업의 재시도 정책", "Set retries for failed tasks"], ["반복 실행에 안전한 작업 설계", "Design tasks safe to repeat"], ["예약된 배치 워크플로 실행", "Run a scheduled batch workflow"],
  ], [
    ["Airflow의 변환은 추출 뒤에 실행돼야 한다. 무엇으로 표현할까?", "An Airflow transform must run after extraction. How is the order expressed?"], ["Airflow의 일시적 다운로드 실패를 다시 시도하려면?", "How should Airflow handle a temporary download failure?"], ["Airflow 재시도로 같은 날짜의 자료가 두 번 추가됐다. 개선 방향은?", "An Airflow retry duplicates a day's rows. What task property needs improvement?"], ["Airflow를 매 이벤트의 지속 처리 엔진 대신 어디에 배치할까?", "Where does Airflow fit instead of acting as a continuous per-event processing engine?"],
  ]),
  kafka: lesson([
    ["같은 파티션 안의 순서 확인", "Check order within one partition"], ["오프셋으로 읽은 위치 기록", "Record read positions with offsets"], ["소비자 그룹으로 작업 분담", "Share consumption within a consumer group"], ["보존 중인 기록 재생", "Replay retained records"],
  ], [
    ["Kafka에서 주문별 순서가 중요하다. 전체 토픽의 단일 순서를 가정하는 대신?", "Kafka order matters per order ID. What scope should replace an assumed total topic order?"], ["Kafka 소비자가 어디까지 읽었는지 이어 가려면?", "How can a Kafka consumer track where to resume reading?"], ["Kafka에서 같은 처리 역할의 소비자들이 파티션을 나눠 맡으려면?", "How do Kafka consumers with the same processing role share partitions?"], ["Kafka에서 아직 보존된 옛 이벤트로 계산을 다시 하려면?", "How can Kafka recompute results from events that are still retained?"],
  ]),
  "kafka-connect": lesson([
    ["소스 커넥터로 가져오기", "Ingest with a source connector"], ["싱크 커넥터로 내보내기", "Export with a sink connector"], ["커넥터 작업 상태 확인", "Inspect connector task status"], ["진행 오프셋 확인", "Inspect progress offsets"],
  ], [
    ["Kafka Connect로 외부 자료를 Kafka에 넣으려면?", "Which Kafka Connect direction brings external data into Kafka?"], ["Kafka Connect로 토픽 자료를 외부 저장소에 쓰려면?", "Which Kafka Connect direction writes topic data to external storage?"], ["Kafka Connect의 일부 전송만 멈췄다. 실행 단위에서 볼 것은?", "Only part of a Kafka Connect transfer stopped. What execution status helps diagnose it?"], ["Kafka Connect를 재시작한 뒤 읽기를 이어 갈 위치를 확인하려면?", "What Kafka Connect state helps inspect the resume position after restart?"],
  ]),
  debezium: lesson([
    ["변경 로그 기반 CDC", "Capture changes from database logs"], ["초기 스냅샷 읽기", "Read an initial snapshot"], ["재시작 위치 보존", "Preserve restart positions"], ["중복 이벤트에 안전한 소비", "Consume events safely under redelivery"],
  ], [
    ["Debezium으로 매번 전체 테이블을 읽는 대신 바뀐 행을 전달하려면?", "How can Debezium deliver changed rows instead of repeatedly scanning the whole table?"], ["Debezium 연결 시 기존 행부터 기준 자료를 만들려면?", "How can Debezium establish the existing rows when a connector starts?"], ["Debezium 장애 후 변경 수집을 이어 가려면 어떤 상태가 중요할까?", "What state matters when Debezium resumes change capture after a failure?"], ["Debezium 이벤트를 재처리했더니 같은 주문이 두 번 생긴다. 소비 쪽 개선은?", "Reprocessed Debezium events create duplicate orders. What consumer property helps?"],
  ]),
  flink: lesson([
    ["이벤트 시간과 워터마크", "Use event time and watermarks"], ["체크포인트로 상태 복구", "Recover state from checkpoints"], ["키별 상태 유지", "Maintain keyed state"], ["늦게 온 이벤트 처리 정책", "Define a late-event policy"],
  ], [
    ["Flink에서 도착 시간이 아닌 실제 발생 시각으로 창을 계산하려면?", "How should Flink reason about windows by occurrence time rather than arrival time?"], ["Flink 작업이 고장 났다. 누적 상태를 되살릴 기반은?", "A Flink job fails. What provides a basis for restoring accumulated state?"], ["Flink에서 사용자별 합계를 계속 기억하려면?", "How can Flink remember a running total per user?"], ["Flink의 닫힌 창에 해당하는 자료가 늦게 도착했다. 무엇을 정해야 할까?", "An event arrives after its Flink window has closed. What policy is needed?"],
  ]),
  spark: lesson([
    ["DataFrame 변환 사용", "Use DataFrame transformations"], ["파티션으로 처리 분배", "Distribute work through partitions"], ["셔플 비용 점검", "Inspect shuffle costs"], ["실행 계획 확인", "Inspect the execution plan"],
  ], [
    ["Spark에서 구조 있는 자료를 열 기준으로 변환하려면?", "How can Spark transform structured records by column?"], ["Spark의 큰 입력을 여러 실행 작업에 나누는 단위는?", "Which unit lets Spark divide a large input among tasks?"], ["Spark의 대규모 join에서 기계 사이 전송이 커졌다. 무엇을 볼까?", "A large Spark join moves much data between machines. What cost needs inspection?"], ["Spark 질의가 왜 느린지 연산의 배치를 먼저 살펴보려면?", "What reveals the arrangement of operations in a slow Spark query?"],
  ]),
  iceberg: lesson([
    ["스냅샷으로 시점 구분", "Distinguish versions with snapshots"], ["스키마 진화 검토", "Review schema evolution"], ["여러 엔진의 테이블 형식 공유", "Share a table format across engines"], ["테이블 메타데이터 확인", "Inspect table metadata"],
  ], [
    ["Iceberg에서 변경 전후의 테이블 시점을 구분하려면?", "How does Iceberg distinguish table versions before and after a change?"], ["Iceberg 테이블에 열을 추가하거나 바꿀 때 점검할 기능은?", "Which Iceberg capability should be reviewed when table fields change?"], ["Iceberg를 자체 SQL 서버로 생각하는 대신 올바른 역할은?", "What role should Iceberg play instead of being mistaken for a standalone SQL server?"], ["Iceberg에서 현재 스냅샷이 참조하는 파일을 추적하려면?", "What should be inspected to trace files referenced by the current Iceberg snapshot?"],
  ]),
  hudi: lesson([
    ["키 기반 업서트", "Upsert by record key"], ["타임라인으로 변경 추적", "Track changes through the timeline"], ["증분 읽기", "Read incrementally"], ["삭제 반영 정책 확인", "Check deletion handling"],
  ], [
    ["Hudi에서 기존 주문 수정과 새 주문 삽입을 함께 반영하려면?", "How can Hudi apply both existing-order updates and new-order inserts?"], ["Hudi 테이블에 어떤 변경 작업이 반영됐는지 보려면?", "How can committed operations on a Hudi table be traced?"], ["Hudi에서 이전 처리 이후 바뀐 자료만 읽으려면?", "How can Hudi read changes since a previous processing point?"], ["원천에서 지운 주문이 Hudi에 계속 남는다. 무엇을 점검할까?", "Orders deleted at the source remain in Hudi. What handling needs inspection?"],
  ]),
  "delta-lake": lesson([
    ["트랜잭션 로그 확인", "Inspect the transaction log"], ["스키마 검사", "Validate the schema"], ["MERGE로 변경 반영", "Apply changes with MERGE"], ["보존된 테이블 버전 조회", "Query a retained table version"],
  ], [
    ["Delta Lake에서 어떤 파일 변경이 테이블에 반영됐는지 기록하는 기반은?", "What records committed file changes in a Delta Lake table?"], ["Delta Lake에 잘못된 열 구조의 자료가 들어오면 먼저 적용할 보호는?", "What protection checks incompatible columns entering Delta Lake?"], ["Delta Lake에서 키가 같은 행을 수정하고 새 행은 넣으려면?", "How can Delta Lake update matching rows and insert new ones?"], ["Delta Lake의 이전 결과를 비교하려면 자료가 남아 있을 때 어떤 읽기를 할까?", "How can a Delta Lake result be compared with an older version while its data is retained?"],
  ]),
  trino: lesson([
    ["커넥터 설정", "Configure a connector"], ["여러 원천에 분산 SQL", "Run distributed SQL across sources"], ["원천으로 필터 푸시다운", "Push filters to the source"], ["Coordinator와 Worker 역할 구분", "Distinguish coordinator and worker roles"],
  ], [
    ["Trino에 새로운 데이터 원천을 연결하려면?", "What connects Trino to a new data source?"], ["Trino에서 서로 다른 저장소의 표를 함께 질의하려면?", "What Trino capability queries tables from different stores together?"], ["Trino가 읽어 올 자료를 원천에서 줄일 수 있을 때 최적화는?", "Which Trino optimization can reduce records returned by a capable source?"], ["Trino에서 질의 계획과 실제 분산 실행을 나눠 이해하려면?", "What roles distinguish Trino query planning from distributed execution?"],
  ]),
  duckdb: lesson([
    ["프로세스 안에서 SQL 실행", "Run SQL inside the process"], ["파일을 직접 분석", "Analyze files directly"], ["열 지향 분석 처리", "Use column-oriented analytics"], ["로컬 자원 한도 점검", "Check local resource limits"],
  ], [
    ["DuckDB를 별도 DB 서버 없이 앱에서 사용하려면?", "How can an app use DuckDB without a separate database server?"], ["DuckDB로 Parquet 자료를 먼저 전부 서버에 적재하지 않고 보려면?", "How can DuckDB inspect Parquet without first loading it all into a server?"], ["DuckDB가 많은 행의 일부 열을 집계하는 데 활용하는 처리 방향은?", "What processing orientation helps DuckDB aggregate selected columns over many rows?"], ["DuckDB 로컬 분석이 메모리 부족으로 멈춘다. 먼저 볼 것은?", "A local DuckDB analysis runs out of memory. What should be inspected first?"],
  ]),
  "dbt-core": lesson([
    ["모델로 변환 정의", "Define transformations as models"], ["ref로 모델 의존성 연결", "Connect model dependencies with ref"], ["데이터 테스트 실행", "Run data tests"], ["모델 문서와 계보 확인", "Inspect model documentation and lineage"],
  ], [
    ["dbt Core에서 원천 자료로 분석용 표를 만드는 로직을 담을 곳은?", "Where should dbt Core define transformations into analytical tables?"], ["dbt Core에서 다른 모델을 참조하며 순서도 표현하려면?", "How can dbt Core reference another model and establish dependency order?"], ["dbt Core의 주문 키가 유일한지 검증하려면?", "How can dbt Core verify that order keys are unique?"], ["dbt Core 모델의 의미와 상류 관계를 팀에 설명하려면?", "What helps explain a dbt Core model's meaning and upstream relationships?"],
  ]),
  "great-expectations": lesson([
    ["기대 조건 정의", "Define expectations"], ["자료를 조건에 검증", "Validate data against expectations"], ["실패한 행과 결과 조사", "Inspect failed rows and validation results"], ["검증 결과를 흐름에 연결", "Integrate validation results into the workflow"],
  ], [
    ["GX에서 나이는 음수가 아니어야 한다는 약속을 만들려면?", "How can GX express that age must not be negative?"], ["GX의 약속을 실제 새 자료에 적용하려면?", "How can GX check a new dataset against its declared rules?"], ["GX 검증에서 실패가 나왔다. 전체를 정상 처리하기 전에 할 일은?", "GX validation fails. What should happen before treating everything as valid?"], ["GX 품질 검사 실패가 게시를 멈추게 하려면?", "How can GX validation failure affect a downstream publishing decision?"],
  ]),
  openlineage: lesson([
    ["Job·Run·Dataset 모델 구분", "Distinguish Job, Run and Dataset"], ["입력·출력 계보 이벤트 전송", "Emit input-output lineage events"], ["Facet으로 메타데이터 확장", "Extend metadata with facets"], ["공통 계보 명세로 교환", "Exchange through a common lineage specification"],
  ], [
    ["OpenLineage에서 작업 정의와 한 번의 실행, 자료를 구분하려면?", "How does OpenLineage separate a job definition, one execution and its data?"], ["OpenLineage로 어떤 자료가 어떤 결과를 만들었는지 기록하려면?", "How can OpenLineage record which inputs produced an output?"], ["OpenLineage의 기본 모델에 추가 정보를 붙이려면?", "How can additional metadata extend an OpenLineage entity?"], ["OpenLineage를 SQL 실행 엔진 대신 어떤 연결 약속으로 볼까?", "What agreement does OpenLineage provide instead of SQL execution?"],
  ]),
  marquez: lesson([
    ["계보 메타데이터 수집·저장", "Collect and store lineage metadata"], ["상류 데이터셋 탐색", "Explore upstream datasets"], ["하류 영향 범위 확인", "Inspect downstream impact"], ["실행 기록과 상태 조회", "Inspect run records and status"],
  ], [
    ["Marquez에 OpenLineage 이벤트를 보내는 주요 목적은?", "Why send OpenLineage events to Marquez?"], ["Marquez에서 잘못된 결과의 원천을 찾으려면?", "Where should Marquez exploration go to find a bad result's origin?"], ["Marquez에서 원천 표의 변경이 어떤 결과에 영향을 줄지 보려면?", "How can Marquez help assess outputs affected by an upstream change?"], ["Marquez에서 같은 작업의 어제와 오늘 실행을 비교하려면?", "What Marquez records help compare yesterday's and today's executions?"],
  ]),
  superset: lesson([
    ["데이터 원천 연결", "Connect a data source"], ["질문에 맞는 차트 선택", "Choose a chart for the question"], ["대시보드 필터 적용", "Apply dashboard filters"], ["지표 정의와 집계 확인", "Inspect metric definitions and aggregation"],
  ], [
    ["Superset에서 분석할 DB의 자료를 보려면 먼저 할 일은?", "What enables Superset to explore data in an analytical database?"], ["Superset에서 날짜별 매출의 추세를 읽기 쉽게 보이려면?", "What design decision makes a sales-over-time trend clear in Superset?"], ["Superset에서 같은 차트를 지역별로 좁혀 보려면?", "How can a Superset viewer narrow a chart to one region?"], ["Superset 차트마다 매출 숫자가 다르다. 색상보다 먼저 볼 것은?", "Superset charts disagree on revenue. What should be checked before colors?"],
  ]),
  mlflow: lesson([
    ["실험의 파라미터·지표 기록", "Log experiment parameters and metrics"], ["모델 결과물 보관", "Store model artifacts"], ["모델 버전 등록", "Register model versions"], ["같은 평가 기준으로 실행 비교", "Compare runs under consistent evaluation"],
  ], [
    ["MLflow로 어떤 학습 설정이 좋은 성능을 냈는지 남기려면?", "How can MLflow record which training settings achieved a result?"], ["MLflow에서 학습된 모델 파일을 실행 기록과 함께 남기려면?", "How can MLflow retain a trained model file with its run?"], ["MLflow에서 같은 모델의 여러 후보를 버전으로 관리하려면?", "How can MLflow organize multiple versions of one model?"], ["MLflow 실험 둘의 점수를 공정하게 비교하려면?", "What makes a comparison of two MLflow experiment scores meaningful?"],
  ]),
  dvc: lesson([
    ["데이터 버전 추적", "Track data versions"], ["원격 결과물 가져오기", "Fetch remote artifacts"], ["의존성과 처리 단계 정의", "Define dependencies and pipeline stages"], ["고정한 버전으로 재현", "Reproduce with pinned versions"],
  ], [
    ["DVC로 큰 학습 자료의 어떤 상태를 사용했는지 남기려면?", "How can DVC record which state of a large training dataset was used?"], ["DVC 메타데이터는 있지만 실제 자료가 없는 동료가 할 일은?", "A teammate has DVC metadata but lacks the actual data. What is needed?"], ["DVC에서 입력 변화에 따른 학습 흐름을 표현하려면?", "How can DVC describe a training pipeline and its inputs?"], ["DVC로 지난 실험을 같은 자료와 설정으로 다시 확인하려면?", "How can DVC help repeat an earlier experiment with matching inputs?"],
  ]),
  feast: lesson([
    ["시점에 맞는 과거 특징 조회", "Retrieve point-in-time historical features"], ["온라인 특징 저지연 조회", "Retrieve online features at low latency"], ["오프라인 특징 자료 구성", "Build offline feature datasets"], ["학습·추론 특징 정의 일치", "Align training and serving feature definitions"],
  ], [
    ["Feast에서 학습 시 미래의 특징이 섞이는 것을 막으려면?", "What Feast retrieval property helps prevent future features leaking into training?"], ["Feast에서 실시간 예측 요청에 특징을 빠르게 제공하려면?", "Which Feast responsibility serves features quickly for a live prediction?"], ["Feast에서 대량 과거 자료로 학습용 특징 표를 만들려면?", "Which Feast responsibility builds feature data for historical training?"], ["Feast의 학습과 실시간 예측이 같은 특징을 다르게 계산한다. 무엇을 맞출까?", "Training and serving disagree on a Feast feature. What definition needs alignment?"],
  ]),
  "scikit-learn": lesson([
    ["학습·평가 자료 먼저 분리", "Split training and evaluation data first"], ["학습 자료에만 전처리 fit", "Fit preprocessing only on training data"], ["Pipeline으로 변환·모델 연결", "Connect transforms and models in a Pipeline"], ["보지 않은 자료로 평가", "Evaluate on unseen data"],
  ], [
    ["scikit-learn에서 평가 정보가 학습으로 새지 않게 하는 첫 경계는?", "What initial boundary helps scikit-learn avoid leaking evaluation data into training?"], ["scikit-learn에서 전체 자료의 평균으로 스케일러를 학습하는 대신?", "Instead of fitting a scikit-learn scaler on the whole dataset, what should happen?"], ["scikit-learn의 교차 검증에서 전처리도 각 학습 구간 안에서 하려면?", "How can scikit-learn keep preprocessing inside each cross-validation training fold?"], ["scikit-learn에서 학습 자료 점수만 좋을 때 일반화를 확인하려면?", "How should scikit-learn check generalization beyond a high training score?"],
  ]),
  opentelemetry: lesson([
    ["애플리케이션 계측", "Instrument the application"], ["요청 문맥 전파", "Propagate request context"], ["Collector로 신호 전달", "Route signals through a Collector"], ["지표·로그·추적 구분", "Distinguish metrics, logs and traces"],
  ], [
    ["OpenTelemetry로 코드의 작업 구간에서 신호를 만들려면?", "How can OpenTelemetry produce telemetry from operations in application code?"], ["OpenTelemetry에서 여러 서비스의 같은 요청을 이어 보려면?", "What links the same request across services in OpenTelemetry?"], ["OpenTelemetry 신호를 받아 가공한 뒤 백엔드로 보내는 구성은?", "What OpenTelemetry component receives, processes and exports signals?"], ["OpenTelemetry에서 수치 추세와 개별 사건, 요청 경로를 혼동하지 않으려면?", "What distinction separates trends, events and request paths in OpenTelemetry?"],
  ]),
  prometheus: lesson([
    ["시계열 지표 수집", "Collect time-series metrics"], ["라벨로 차원 구분", "Distinguish dimensions with labels"], ["PromQL로 질의", "Query with PromQL"], ["경보 규칙 평가", "Evaluate alerting rules"],
  ], [
    ["Prometheus로 시간에 따른 요청 수와 지연을 기록하려면?", "What Prometheus role records request counts and latency over time?"], ["Prometheus에서 같은 지표의 서비스별 값을 나누는 개념은?", "What distinguishes per-service values of one Prometheus metric?"], ["Prometheus의 수집된 수치를 조건·집계로 계산하려면?", "How can collected Prometheus metrics be filtered and aggregated?"], ["Prometheus에서 오류율 조건이 지속되는지 판정하려면?", "What Prometheus responsibility evaluates a sustained error-rate condition?"],
  ]),
  grafana: lesson([
    ["관측 데이터 원천 연결", "Connect observability data sources"], ["패널로 수치 시각화", "Visualize measurements with panels"], ["시간 범위 맞추기", "Align the time range"], ["변수로 서비스 범위 선택", "Select services through variables"],
  ], [
    ["Grafana에서 Prometheus의 수치를 표시하려면 먼저?", "What lets Grafana display measurements from Prometheus?"], ["Grafana에서 오류율의 추세를 그래프로 보이려면?", "How can Grafana display an error-rate trend as a graph?"], ["Grafana의 두 화면이 서로 다른 시각을 보여 비교가 틀렸다. 무엇을 맞출까?", "Two Grafana views cover different periods. What must match for comparison?"], ["Grafana에서 같은 대시보드를 서비스별로 전환하려면?", "How can one Grafana dashboard switch among services?"],
  ]),
  "argo-cd": lesson([
    ["Git의 원하는 상태와 비교", "Compare with desired state in Git"], ["동기화로 선언 반영", "Apply declarations through synchronization"], ["차이와 상태 확인", "Inspect drift and health"], ["검토한 Git 변경으로 되돌리기", "Revert through a reviewed Git change"],
  ], [
    ["Argo CD가 클러스터에서 지킬 배포 약속의 기준은?", "What is Argo CD's declared reference for a cluster deployment?"], ["Argo CD에서 승인된 선언을 실제 클러스터에 적용하려면?", "What Argo CD operation applies approved declarations to the cluster?"], ["Argo CD에서 운영자가 수동 변경한 뒤 불일치를 찾으려면?", "How can Argo CD reveal a mismatch after a manual cluster change?"], ["Argo CD의 GitOps 흐름에서 잘못된 선언을 이전 상태로 복구하려면?", "How can an Argo CD GitOps workflow restore a previous declared state?"],
  ]),
  opentofu: lesson([
    ["구성으로 자원 선언", "Declare resources in configuration"], ["plan으로 변경 검토", "Review changes with plan"], ["apply로 승인한 변경 적용", "Apply approved changes"], ["상태와 실제 자원 관계 관리", "Manage state-to-resource relationships"],
  ], [
    ["OpenTofu에서 필요한 서버와 네트워크를 코드로 표현하려면?", "How does OpenTofu express required servers and networks as code?"], ["OpenTofu가 자원을 지우려 하는지 실행 전에 확인하려면?", "How can OpenTofu changes be inspected before resources are modified?"], ["OpenTofu에서 검토한 자원 변경을 실제 수행하려면?", "What OpenTofu operation performs reviewed resource changes?"], ["OpenTofu가 선언과 실제 자원의 연결을 기억하도록 지킬 자료는?", "What OpenTofu information maps declarations to actual resources?"],
  ]),
  postgresql: lesson([
    ["트랜잭션으로 함께 반영", "Commit related changes in a transaction"], ["제약 조건으로 무결성 보호", "Protect integrity with constraints"], ["인덱스와 실행 계획 점검", "Inspect indexes and query plans"], ["ROLLBACK으로 묶음 취소", "Cancel the transaction with ROLLBACK"],
  ], [
    ["PostgreSQL에서 이체의 출금과 입금이 함께 성공해야 한다. 적용 단위는?", "PostgreSQL must commit both debit and credit of a transfer together. What unit helps?"], ["PostgreSQL에서 중복 주문 키를 DB가 거부하도록 하려면?", "How can PostgreSQL reject duplicate order keys at the database boundary?"], ["PostgreSQL 조회가 느려졌다. 조회 경로를 이해하기 위해 볼 것은?", "What helps explain the access path of a slow PostgreSQL query?"], ["PostgreSQL 트랜잭션의 중간 단계가 실패했다. 전체 묶음을 포기하려면?", "An intermediate PostgreSQL transaction step fails. How can the unit be abandoned?"],
  ]),
  "tanstack-query": lesson([
    ["쿼리 키로 캐시 구분", "Distinguish cached data with query keys"], ["변경 뒤 관련 캐시 무효화", "Invalidate related queries after mutation"], ["로딩·오류 상태 표시", "Display loading and error states"], ["재요청으로 오래된 자료 갱신", "Refetch stale server data"],
  ], [
    ["TanStack Query에서 다른 사용자의 주문이 같은 캐시에 섞인다. 무엇을 나눌까?", "TanStack Query mixes orders for different users. What cache identity needs separation?"], ["TanStack Query로 주문을 수정했는데 목록이 오래된 값이다. 무엇을 알릴까?", "A TanStack Query mutation succeeds but the list is stale. What should be marked?"], ["TanStack Query 요청이 지연되거나 실패할 때 사용자에게 보여 줄 것은?", "What UI state should accompany a delayed or failed TanStack Query request?"], ["TanStack Query가 가진 서버 자료를 최신 상태와 다시 맞추려면?", "How can TanStack Query refresh its local view of server data?"],
  ]),
  zod: lesson([
    ["스키마로 입력 구조 선언", "Declare input structure with a schema"], ["런타임 파싱·검증", "Parse and validate at runtime"], ["검증 오류를 명시적으로 처리", "Handle validation errors explicitly"], ["스키마에서 정적 타입 추론", "Infer static types from the schema"],
  ], [
    ["Zod에서 이름은 문자열, 나이는 숫자라는 약속을 만들려면?", "How can Zod declare a string name and numeric age?"], ["TypeScript 타입만으로 외부 JSON을 믿는 대신 Zod로 할 일은?", "What should Zod do instead of trusting external JSON because of a TypeScript type?"], ["Zod safeParse가 실패 결과를 돌려줬다. 올바른 흐름은?", "Zod safeParse returns a failure result. What should the flow handle?"], ["Zod 스키마와 별도 타입 정의가 달라지는 것을 줄이려면?", "How can Zod reduce drift between a schema and its TypeScript definition?"],
  ]),
  playwright: lesson([
    ["사용자 역할·이름으로 요소 찾기", "Locate elements by user-facing role and name"], ["조건을 기다리는 assertion 사용", "Use assertions that wait for conditions"], ["테스트 간 상태 격리", "Isolate state between tests"], ["실제 사용자 흐름 검증", "Verify a complete user journey"],
  ], [
    ["Playwright에서 바뀌기 쉬운 내부 CSS 대신 버튼을 안정적으로 찾으려면?", "How can Playwright locate a button without relying on fragile internal CSS?"], ["Playwright에서 임의의 긴 sleep 대신 화면 준비를 확인하려면?", "What should Playwright use instead of arbitrary long sleeps to check readiness?"], ["Playwright 테스트 실행 순서에 따라 결과가 달라진다. 개선할 경계는?", "Playwright results depend on test order. What boundary needs improvement?"], ["Playwright로 검색부터 주문 완료까지 연결된 동작을 확인하려면?", "What should Playwright verify from search through order completion?"],
  ]),
};

function question(prompt: LocalizedText, correct: LocalizedText, distractors: readonly LocalizedText[], index: number, explanation: LocalizedText): QuizQuestion {
  const choices = [...distractors.slice(0, 3)];
  const answerIndex = index % 4;
  choices.splice(answerIndex, 0, correct);
  return { prompt, choices, answerIndex, explanation };
}
export function openSourceQuizSource(stageId: string): readonly QuizQuestion[] {
  const id = stageId.replace(/^open-source:/, "");
  const entry = OPEN_SOURCE_CATALOG.find((candidate) => candidate.id === id);
  const authored = lessons[id];
  if (!entry || !authored) throw new Error(`Missing open-source lesson: ${stageId}`);
  const other = OPEN_SOURCE_CATALOG.filter((candidate) => candidate.family !== entry.family).slice(0, 3);
  const kinds: readonly OpenSourceKind[] = ["project", "component", "format", "specification"];
  const kind = OPEN_SOURCE_KIND_LABELS[entry.kind];
  const kindExplanation = entry.parentId
    ? text(`${entry.name}는 ${OPEN_SOURCE_CATALOG.find(({ id }) => id === entry.parentId)!.name}의 구성요소입니다.`, `${entry.name} is a component of ${OPEN_SOURCE_CATALOG.find(({ id }) => id === entry.parentId)!.name}.`)
    : text(`${entry.name}: ${kind.ko}. ${entry.role.ko}.`, `${entry.name}: ${kind.en}. ${entry.role.en}.`);
  return [
    question(text(`${entry.name}의 주된 역할은?`, `What is the primary role of ${entry.name}?`), entry.role, other.map(({ role }) => role), 0, entry.role),
    question(text(`${entry.name} 의뢰에서 함께 익힐 개념 묶음은?`, `Which concepts belong to this ${entry.name} mission?`), entry.learning, other.map(({ learning }) => learning), 1, entry.role),
    question(text(`${entry.name}를 이 탐험에서 어떤 종류로 구분할까?`, `How is ${entry.name} classified in this expedition?`), kind, kinds.filter((value) => value !== entry.kind).map((value) => OPEN_SOURCE_KIND_LABELS[value]), 2, kindExplanation),
    ...authored.situations.map(([ko, en], index) => {
      const correct = text(...authored.actions[index]);
      return question(text(ko, en), correct, authored.actions.filter((_, i) => i !== index).map(([a, b]) => text(a, b)), index + 3,
        text(`${correct.ko}. ${entry.role.ko}.`, `${correct.en}. ${entry.role.en}.`));
    }),
  ];
}
