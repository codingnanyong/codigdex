import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import type { JobId } from "./player/jobs";

export const OPEN_SOURCE_FAMILIES = {
  hadoop: text("하둡 생태계", "Hadoop ecosystem"),
  orchestration: text("워크플로", "Workflows"),
  streaming: text("수집·스트리밍", "Ingestion & streaming"),
  lakehouse: text("레이크·쿼리", "Lakes & queries"),
  quality: text("품질·계보", "Quality & lineage"),
  analytics: text("분석·시각화", "Analytics & visualization"),
  ml: text("머신러닝", "Machine learning"),
  platform: text("플랫폼·관측", "Platform & observability"),
  application: text("애플리케이션", "Applications"),
} as const;
export type OpenSourceFamily = keyof typeof OPEN_SOURCE_FAMILIES;
export type OpenSourceKind = "project" | "component" | "format" | "specification";
export const OPEN_SOURCE_KIND_LABELS: Record<OpenSourceKind, LocalizedText> = {
  project: text("프로젝트", "Project"), component: text("구성요소", "Component"),
  format: text("데이터 형식", "Data format"), specification: text("개방 명세", "Open specification"),
};
export interface OpenSourceEntry {
  id: string; name: string; family: OpenSourceFamily; kind: OpenSourceKind;
  /** Only actual subcomponents use parentId. Related projects share a family. */
  parentId?: string;
  priority: 1 | 2;
  role: LocalizedText; learning: LocalizedText;
  character: { name: LocalizedText; motif: LocalizedText; artStatus: "concept" | "ready"; assetKey?: string };
  paths: readonly JobId[]; regions: readonly string[]; officialUrl: string;
}
type Pair = readonly [ko: string, en: string];
const de: readonly JobId[] = ["data-engineer"];
const data: readonly JobId[] = ["data-engineer", "data-analyst"];
const ops: readonly JobId[] = ["devops", "backend", "data-engineer"];
function entry(id: string, name: string, family: OpenSourceFamily, priority: 1 | 2, role: Pair, learning: Pair,
  character: Pair, motif: Pair, paths: readonly JobId[], regions: readonly string[], officialUrl: string,
  kind: OpenSourceKind = "project", parentId?: string): OpenSourceEntry {
  return { id, name, family, priority, role: text(...role), learning: text(...learning),
    character: { name: text(...character), motif: text(...motif), artStatus: "ready", assetKey: `characters/open-source/${id}-v1.png` }, paths, regions, officialUrl, kind, ...(parentId ? { parentId } : {}) };
}

/** Tool identities and portraits shared by learning notes and optional capturable expeditions.
 * Roles are grounded in each linked project's official documentation; creature designs are original proposals.
 */
export const OPEN_SOURCE_CATALOG: readonly OpenSourceEntry[] = [
  entry("hadoop", "Apache Hadoop", "hadoop", 1,
    ["분산 저장·자원 관리·병렬 처리의 기반", "Foundation for distributed storage, resource management and parallel processing"],
    ["클러스터 · 장애 대응 · 구성요소의 협력", "Clusters · fault handling · cooperation between components"],
    ["하둡 숲의 코끼리", "Hadoop Forest Elephant"], ["서로 다른 역할의 코끼리들을 이끄는 큰 숲의 수호자", "A forest guardian leading elephants with distinct roles"], de, ["data-pipeline"], "https://hadoop.apache.org/"),
  entry("hdfs", "Hadoop HDFS", "hadoop", 1,
    ["대용량 데이터를 분산 저장하는 파일 시스템", "Distributed file system for large datasets"], ["블록 · 복제 · NameNode/DataNode", "Blocks · replication · NameNode/DataNode"],
    ["블록 보관 코끼리", "Block Keeper Elephant"], ["잎 꾸러미를 여러 둥지에 나눠 보관하는 코끼리", "An elephant storing leaf bundles in several nests"], de, ["data-pipeline"], "https://hadoop.apache.org/", "component", "hadoop"),
  entry("yarn", "Hadoop YARN", "hadoop", 1,
    ["클러스터 자원과 작업 실행을 관리", "Manages cluster resources and job execution"], ["자원 할당 · 스케줄링 · 컨테이너", "Resource allocation · scheduling · containers"],
    ["일감 조율 코끼리", "Resource Steward Elephant"], ["숲의 먹이와 일감을 알맞게 나눠 주는 코끼리", "An elephant fairly distributing food and tasks through the forest"], de, ["data-pipeline", "orchestration"], "https://hadoop.apache.org/", "component", "hadoop"),
  entry("mapreduce", "Hadoop MapReduce", "hadoop", 1,
    ["대량 자료를 나누어 병렬 처리", "Processes large datasets in parallel"], ["Map · Shuffle · Reduce", "Map · Shuffle · Reduce"],
    ["조각 모음 코끼리 쌍", "Gathering Elephant Twins"], ["한 마리는 씨앗을 분류하고 다른 마리는 같은 씨앗을 모으는 쌍둥이", "Twins that classify seeds and gather matching seeds"], de, ["data-pipeline"], "https://hadoop.apache.org/", "component", "hadoop"),
  entry("hive", "Apache Hive", "hadoop", 1,
    ["분산 저장 데이터에 SQL 분석 제공", "Provides SQL analytics over distributed storage"], ["테이블 · 파티션 · 메타스토어 · 집계", "Tables · partitions · metastore · aggregation"],
    ["벌집 기록벌", "Hive Archivist Bee"], ["자료의 위치를 벌집 무늬에 기록하는 벌", "A bee recording data locations in honeycomb markings"], data, ["sql", "data-pipeline"], "https://hive.apache.org/"),
  entry("hbase", "Apache HBase", "hadoop", 2,
    ["대규모 테이블의 분산 읽기·쓰기", "Distributed reads and writes over large tables"], ["행 키 · 컬럼 패밀리 · 리전", "Row keys · column families · regions"],
    ["행키 오소리", "Rowkey Badger"], ["넓은 굴의 자료를 행 키 발자국으로 찾는 오소리", "A badger locating records in a vast burrow using rowkey tracks"], ["backend", "data-engineer"], ["data-pipeline", "sql"], "https://hbase.apache.org/"),
  entry("zookeeper", "Apache ZooKeeper", "hadoop", 2,
    ["분산 애플리케이션의 조정 서비스", "Coordination service for distributed applications"], ["구성 관리 · 리더 선출 · 변경 알림", "Configuration · leader election · watches"],
    ["숲지기 미어캣", "Forest Watch Meerkat"], ["서로의 신호를 살피며 숲의 순서를 맞추는 미어캣", "A meerkat coordinating forest activity by watching shared signals"], ops, ["network", "data-pipeline"], "https://zookeeper.apache.org/"),
  entry("avro", "Apache Avro", "hadoop", 2,
    ["스키마를 사용하는 데이터 직렬화", "Schema-based data serialization"], ["직렬화 · 읽기/쓰기 스키마 · 호환성", "Serialization · reader/writer schemas · compatibility"],
    ["무늬 전달 나비", "Schema Courier Butterfly"], ["같은 무늬 약속으로 정보를 전하는 나비", "A butterfly delivering information through agreed wing patterns"], ["backend", "data-engineer"], ["data-pipeline", "http-api"], "https://avro.apache.org/", "format"),
  entry("parquet", "Apache Parquet", "hadoop", 2,
    ["분석에 적합한 열 지향 파일 형식", "Column-oriented file format for analytics"], ["열 저장 · 압축 · 필요한 열 읽기", "Column storage · compression · column projection"],
    ["겹잎 천산갑", "Columnleaf Pangolin"], ["같은 종류의 잎을 겹겹이 정리하는 천산갑", "A pangolin arranging leaves by kind in layered scales"], data, ["data-pipeline", "sql"], "https://parquet.apache.org/", "format"),
  entry("airflow", "Apache Airflow", "orchestration", 1,
    ["코드로 정의하는 배치 워크플로 관리", "Manages batch-oriented workflows defined as code"], ["DAG · 작업 의존성 · 스케줄 · 재시도", "DAGs · task dependencies · schedules · retries"],
    ["에어플로 바람새", "Airflow Windwing"], ["바람 깃털로 여러 생물의 작업 순서를 지휘하는 새", "A bird conducting task order with wind-shaped feathers"], de, ["orchestration"], "https://airflow.apache.org/docs/apache-airflow/stable/index.html"),
  entry("kafka", "Apache Kafka", "streaming", 1,
    ["이벤트를 발행·저장·구독하는 분산 플랫폼", "Distributed platform for publishing, retaining and consuming events"], ["토픽 · 파티션 · 오프셋 · 소비자 그룹", "Topics · partitions · offsets · consumer groups"],
    ["카프카 전령 까마귀", "Kafka Courier Raven"], ["갈래별 순서대로 씨앗 소식을 운반하는 까마귀 무리", "Ravens carrying seed messages in order within each route"], ["backend", "data-engineer"], ["data-pipeline"], "https://kafka.apache.org/intro/"),
  entry("kafka-connect", "Kafka Connect", "streaming", 2,
    ["Kafka와 외부 시스템 사이의 데이터 연결", "Connects Kafka with external data systems"], ["소스/싱크 커넥터 · 작업 · 오프셋", "Source/sink connectors · tasks · offsets"],
    ["연결 다람쥐", "Connector Squirrel"], ["서로 다른 둥지 사이에 씨앗 길을 잇는 다람쥐", "A squirrel connecting seed routes between different nests"], de, ["data-pipeline"], "https://kafka.apache.org/documentation/#connect", "component", "kafka"),
  entry("debezium", "Debezium", "streaming", 1,
    ["데이터베이스 변경을 이벤트로 전달하는 CDC", "Captures database changes as events through CDC"], ["변경 로그 · 스냅샷 · 재시작 위치", "Change logs · snapshots · restart positions"],
    ["변화 감지 도마뱀", "Change Watch Gecko"], ["바뀐 잎만 찾아 꼬리 무늬로 알리는 도마뱀", "A gecko signaling only changed leaves through tail markings"], ["backend", "data-engineer"], ["data-pipeline", "sql"], "https://debezium.io/documentation/reference/stable/"),
  entry("flink", "Apache Flink", "streaming", 1,
    ["상태를 유지하는 분산 스트림 처리", "Distributed stateful stream processing"], ["이벤트 시간 · 워터마크 · 상태 · 체크포인트", "Event time · watermarks · state · checkpoints"],
    ["물결 기억 다람쥐", "Stream Memory Squirrel"], ["지나간 물결을 기억하고 늦은 물방울도 살피는 다람쥐", "A squirrel remembering waves and accounting for late droplets"], de, ["data-pipeline"], "https://flink.apache.org/"),
  entry("spark", "Apache Spark", "lakehouse", 1,
    ["대규모 배치·스트리밍 데이터 처리 엔진", "Engine for large-scale batch and streaming data processing"], ["DataFrame · 파티션 · 셔플 · 실행 계획", "DataFrames · partitions · shuffle · execution plans"],
    ["불꽃 분산 여우", "Spark Ember Fox"], ["여러 불꽃 꼬리로 나눈 일을 함께 끝내는 여우", "A fox completing divided work with several ember tails"], data, ["data-pipeline", "sql"], "https://spark.apache.org/"),
  entry("iceberg", "Apache Iceberg", "lakehouse", 1,
    ["여러 엔진이 공유하는 분석 테이블 형식", "Analytical table format shared by multiple engines"], ["스냅샷 · 스키마 변경 · 테이블 메타데이터", "Snapshots · schema evolution · table metadata"],
    ["빙층 기록 펭귄", "Snapshot Penguin"], ["얼음 층에 자료의 여러 시점을 남기는 펭귄", "A penguin preserving data snapshots in ice layers"], data, ["data-pipeline", "sql"], "https://iceberg.apache.org/", "format"),
  entry("hudi", "Apache Hudi", "lakehouse", 2,
    ["변경과 증분 처리를 다루는 데이터 레이크 플랫폼", "Data lake platform for updates and incremental processing"], ["업서트 · 타임라인 · 증분 읽기", "Upserts · timelines · incremental reads"],
    ["새싹 갱신 사슴", "Incremental Sprout Deer"], ["새로 자란 잎과 바뀐 가지를 찾아 돌보는 사슴", "A deer tending newly grown leaves and changed branches"], de, ["data-pipeline"], "https://hudi.apache.org/"),
  entry("delta-lake", "Delta Lake", "lakehouse", 2,
    ["데이터 레이크에 신뢰할 수 있는 테이블 관리 제공", "Provides reliable table management for data lakes"], ["트랜잭션 로그 · ACID · 스키마 검사", "Transaction logs · ACID · schema enforcement"],
    ["호수 기록 거북", "Lake Ledger Turtle"], ["등껍질의 기록을 따라 호수의 변화를 지키는 거북", "A turtle guarding lake changes through a shell ledger"], data, ["data-pipeline", "sql"], "https://delta.io/"),
  entry("trino", "Trino", "lakehouse", 1,
    ["여러 데이터 원천에 분산 SQL 쿼리 수행", "Runs distributed SQL queries across data sources"], ["커넥터 · 분산 쿼리 · 푸시다운", "Connectors · distributed queries · pushdown"],
    ["갈래 탐색 토끼", "Query Trail Rabbit"], ["여러 길의 단서를 빠르게 모으는 토끼", "A rabbit gathering clues across several data trails"], data, ["sql", "data-pipeline"], "https://trino.io/"),
  entry("duckdb", "DuckDB", "lakehouse", 2,
    ["프로세스 안에서 실행하는 분석용 SQL 데이터베이스", "In-process analytical SQL database"], ["로컬 분석 · 열 처리 · 파일 조회", "Local analytics · columnar execution · file queries"],
    ["연못 분석 오리", "Pond Analyst Duck"], ["작은 연못에서도 잎 자료를 꼼꼼히 읽는 오리", "A duck carefully analyzing leaf records in a small pond"], data, ["sql", "python"], "https://duckdb.org/"),
  entry("dbt-core", "dbt Core", "quality", 2,
    ["분석 데이터 변환을 모델·테스트로 관리", "Manages analytical transformations as models and tests"], ["모델 · 참조 · 테스트 · 문서", "Models · references · tests · documentation"],
    ["모델 조립 비버", "Model Builder Beaver"], ["나뭇가지의 연결과 튼튼함을 함께 확인하는 비버", "A beaver checking both branch connections and strength"], data, ["sql", "data-pipeline", "bi-tools"], "https://docs.getdbt.com/docs/build/data-tests"),
  entry("great-expectations", "Great Expectations (GX Core)", "quality", 2,
    ["데이터의 기대 조건을 검증하는 라이브러리", "Library for validating data expectations"], ["기대 조건 · 데이터 검증 · 실패 행 조사", "Expectations · validation · investigation of failed rows"],
    ["맑은눈 개구리", "Clear-Eyed Frog"], ["연못의 이상한 물방울을 찾아내는 개구리", "A frog spotting unexpected droplets in its pond"], data, ["data-pipeline", "sql"], "https://docs.greatexpectations.io/docs/core/introduction/"),
  entry("openlineage", "OpenLineage", "quality", 2,
    ["데이터 작업과 입력·출력의 계보 메타데이터", "Lineage metadata for jobs and their inputs and outputs"], ["작업 · 실행 · 데이터셋 · 계보 이벤트", "Jobs · runs · datasets · lineage events"],
    ["계보 가지 사슴", "Lineage Branch Stag"], ["뿔의 가지로 자료가 온 길과 갈 길을 보여 주는 사슴", "A stag whose antlers reveal data origins and destinations"], de, ["orchestration", "data-pipeline"], "https://openlineage.io/", "specification"),
  entry("marquez", "Marquez", "quality", 2,
    ["OpenLineage 메타데이터의 수집·저장·시각화", "Collects, stores and visualizes OpenLineage metadata"], ["계보 그래프 · 원천 추적 · 변경 영향", "Lineage graphs · origin tracing · change impact"],
    ["발자국 지도 부엉이", "Lineage Map Owl"], ["숲의 발자국을 넓은 지도처럼 읽는 부엉이", "An owl reading forest tracks as a lineage map"], de, ["orchestration", "monitoring"], "https://marquezproject.ai/"),
  entry("superset", "Apache Superset", "analytics", 2,
    ["데이터 탐색과 대시보드 시각화", "Data exploration and dashboard visualization"], ["차트 · 대시보드 · 필터 · 지표", "Charts · dashboards · filters · metrics"],
    ["별지도 나비", "Dashboard Butterfly"], ["날개 무늬로 여러 자료의 이야기를 보여 주는 나비", "A butterfly whose wing patterns tell stories from several datasets"], ["data-analyst"], ["visualization", "bi-tools"], "https://superset.apache.org/"),
  entry("mlflow", "MLflow", "ml", 2,
    ["ML 실험과 모델 버전·계보·등록 관리", "Manages ML experiments, model versions, lineage and registration"], ["실험 실행 · 결과물 · 모델 등록 · 승격", "Experiment runs · artifacts · model registry · promotion"],
    ["모델 기록 거북", "Model Ledger Tortoise"], ["검증한 모델의 이력을 등껍질 무늬에 보관하는 거북", "A tortoise preserving verified model histories in its shell"], ["backend", "data-engineer", "devops"], ["python", "orchestration"], "https://mlflow.org/docs/latest/ml/model-registry/"),
  entry("dvc", "DVC", "ml", 2,
    ["데이터·모델 버전과 재현 가능한 흐름 관리", "Manages data/model versions and reproducible pipelines"], ["데이터 버전 · 결과물 · 의존성 · 재현", "Data versions · artifacts · dependencies · reproduction"],
    ["씨앗 보관 햄스터", "Version Seed Hamster"], ["씨앗의 출처와 재배법을 함께 모아 두는 햄스터", "A hamster storing seed provenance together with growing recipes"], de, ["python", "data-pipeline", "orchestration"], "https://dvc.org/"),
  entry("feast", "Feast", "ml", 2,
    ["학습과 추론에 특징 데이터를 제공하는 특징 저장소", "Feature store supplying data for training and inference"], ["온라인/오프라인 특징 · 시점 일치 · 특징 제공", "Online/offline features · point-in-time correctness · feature serving"],
    ["특징 잎 사슴", "Feature Leaf Deer"], ["같은 기준의 잎을 알맞은 시점에 건네는 사슴", "A deer delivering consistently defined leaves at the right time"], ["backend", "data-engineer"], ["python", "data-pipeline"], "https://feast.dev/"),
  entry("scikit-learn", "scikit-learn", "ml", 2,
    ["전처리·모델 학습·평가를 위한 ML 라이브러리", "ML library for preprocessing, training and evaluation"], ["전처리 · 데이터 누수 · 분할 · 평가", "Preprocessing · leakage · splits · evaluation"],
    ["검증 눈 스라소니", "Validation Lynx"], ["배운 잎과 시험할 잎을 구분해 지키는 스라소니", "A lynx keeping training leaves separate from evaluation leaves"], ["data-engineer", "data-analyst", "backend"], ["python", "statistics"], "https://scikit-learn.org/stable/common_pitfalls.html"),
  entry("opentelemetry", "OpenTelemetry", "platform", 2,
    ["지표·로그·추적을 계측하고 수집·전달", "Instruments, collects and exports metrics, logs and traces"], ["계측 · 문맥 전파 · span · 수집기", "Instrumentation · context propagation · spans · collectors"],
    ["세빛 메아리 부엉이", "Three-Signal Echo Owl"], ["세 가지 깃털 신호로 요청의 자취를 잇는 부엉이", "An owl linking request trails with three feather signals"], ops, ["monitoring", "http-api"], "https://opentelemetry.io/docs/what-is-opentelemetry/"),
  entry("prometheus", "Prometheus", "platform", 2,
    ["시계열 지표를 수집하고 경보를 평가", "Collects time-series metrics and evaluates alerts"], ["메트릭 · 라벨 · PromQL · 경보 규칙", "Metrics · labels · PromQL · alert rules"],
    ["약속 불빛 거북", "Promise Beacon Turtle"], ["등의 불빛으로 숲의 약속과 이상 신호를 알리는 거북", "A turtle signaling forest objectives and anomalies with its shell glow"], ops, ["monitoring"], "https://prometheus.io/docs/introduction/overview/"),
  entry("grafana", "Grafana OSS", "platform", 2,
    ["여러 관측 자료를 대시보드로 시각화", "Visualizes observability data in dashboards"], ["데이터 원천 · 패널 · 대시보드 · 탐색", "Data sources · panels · dashboards · exploration"],
    ["빛무늬 관측 나방", "Signal Pattern Moth"], ["여러 신호를 알아보기 쉬운 날개 무늬로 보여 주는 나방", "A moth displaying several signals as readable wing patterns"], ops, ["monitoring", "visualization"], "https://grafana.com/oss/grafana/"),
  entry("argo-cd", "Argo CD", "platform", 2,
    ["Git의 선언을 Kubernetes 배포 상태와 맞추는 GitOps 도구", "GitOps tool reconciling Git declarations with Kubernetes deployments"], ["원하는 상태 · 동기화 · 차이 감지 · 복구", "Desired state · synchronization · drift detection · recovery"],
    ["출항 보따리 소라게", "Release Parcel Hermit"], ["출항 약속과 실제 항로를 맞추며 보따리를 옮기는 소라게", "A hermit matching departure plans to actual routes while carrying parcels"], ops, ["cicd", "kubernetes"], "https://argoproj.github.io/cd/"),
  entry("opentofu", "OpenTofu", "platform", 2,
    ["인프라 자원을 코드로 선언·계획·적용", "Declares, plans and applies infrastructure as code"], ["선언 · 계획 · 상태 · 변경 검토", "Declarations · plans · state · change review"],
    ["설계 굴 비버", "Infrastructure Burrow Beaver"], ["먼저 가지 설계도를 살피고 숲의 터를 만드는 비버", "A beaver inspecting branch plans before shaping forest habitats"], ops, ["cloud-iac"], "https://opentofu.org/"),
  entry("postgresql", "PostgreSQL", "application", 2,
    ["일관된 데이터 변경을 지원하는 관계형 데이터베이스", "Relational database supporting consistent data updates"], ["SQL · 제약 · 트랜잭션 · 동시성", "SQL · constraints · transactions · concurrency"],
    ["약속 지킴 코끼리", "Transaction Guardian Elephant"], ["함께 옮겨야 할 씨앗을 한 묶음으로 지키는 코끼리", "An elephant protecting seed bundles that must move together"], ["backend", "data-engineer", "data-analyst"], ["sql", "server-framework"], "https://www.postgresql.org/about/"),
  entry("tanstack-query", "TanStack Query", "application", 2,
    ["서버 데이터의 요청·캐시·갱신 상태 관리", "Manages fetching, caching and updating server state"], ["서버 상태 · 쿼리 키 · 캐시 무효화 · 재요청", "Server state · query keys · invalidation · refetching"],
    ["기억 연못 수달", "Cache Pond Otter"], ["기억한 조약돌을 구분하고 낡은 정보를 다시 찾는 수달", "An otter organizing remembered pebbles and refreshing stale information"], ["frontend"], ["react", "http-api"], "https://tanstack.com/query/latest/docs/framework/react/overview"),
  entry("zod", "Zod", "application", 2,
    ["런타임 데이터 스키마 검증", "Runtime data schema validation"], ["스키마 · 파싱 · 입력 오류 · 자료형", "Schemas · parsing · input errors · types"],
    ["약속 무늬 여우", "Contract Pattern Fox"], ["입구에서 잎의 모양과 약속을 확인하는 여우", "A fox checking leaf shapes against their agreed contract at the entrance"], ["frontend", "backend"], ["http-api", "javascript", "frontend-testing"], "https://zod.dev/"),
  entry("playwright", "Playwright", "application", 2,
    ["브라우저 사용자 흐름을 자동 검증", "Automates verification of browser user journeys"], ["E2E · 사용자 흐름 · assertion · 격리", "E2E · user journeys · assertions · isolation"],
    ["여정 확인 기린", "Journey Check Kirin"], ["다리의 처음부터 끝까지 발자국을 확인하는 기린", "A kirin checking the entire trail from one end of a bridge to the other"], ["frontend", "backend", "devops"], ["frontend-testing", "cicd"], "https://playwright.dev/"),
];

export function findOpenSource(id: string): OpenSourceEntry | undefined {
  return OPEN_SOURCE_CATALOG.find((entry) => entry.id === id);
}
export function openSourcesForRegion(regionId: string, jobId: JobId): readonly OpenSourceEntry[] {
  return OPEN_SOURCE_CATALOG.filter((entry) => entry.regions.includes(regionId) && entry.paths.includes(jobId));
}
export interface OpenSourceFilter { query?: string; family?: OpenSourceFamily; jobId?: JobId; ids?: readonly string[] }
export function filterOpenSources({ query = "", family, jobId, ids }: OpenSourceFilter = {}): readonly OpenSourceEntry[] {
  const terms = query.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);
  return OPEN_SOURCE_CATALOG.filter((entry) => {
    if (family && entry.family !== family || jobId && !entry.paths.includes(jobId) || ids && !ids.includes(entry.id)) return false;
    const copy = [entry.name, ...Object.values(OPEN_SOURCE_FAMILIES[entry.family]), ...Object.values(entry.role), ...Object.values(entry.learning), ...Object.values(entry.character.name), ...Object.values(entry.character.motif)].join(" ").normalize("NFKC").toLowerCase();
    return terms.every((term) => copy.includes(term));
  });
}
