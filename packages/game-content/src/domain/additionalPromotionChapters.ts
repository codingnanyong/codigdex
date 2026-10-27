import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import { quizPackIdFor } from "@codigdex/game-core/domain/dex/quiz";
import type { ChapterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { FULLSTACK_STAGE_IDS, ML_STAGE_IDS, MLOPS_STAGE_IDS, ANALYTICS_STAGE_IDS } from "./promotionIds";
import type { SecondaryJobId } from "./player/jobs";

export interface PromotionMission {
  chapter: ChapterDefinition;
  guideAssetKey: string;
  scenery: "platform" | "fullstack" | "ml" | "mlops" | "analytics";
  story: { intro: LocalizedText; ending: LocalizedText };
}

type StageCopy = {
  name: LocalizedText; concept: LocalizedText; lesson: LocalizedText;
  challenge: LocalizedText; snippet: string;
};
function mission(job: SecondaryJobId, label: string, firstDex: number, folder: string, ids: readonly string[], scenery: PromotionMission["scenery"],
  name: LocalizedText, npcName: LocalizedText, intro: LocalizedText, ending: LocalizedText, copies: readonly StageCopy[]): PromotionMission {
  const chapterId = `promotion:${job}` as const;
  return {
    guideAssetKey: `characters/promotion/${job}/guide-v1.png`, scenery, story: { intro, ending },
    chapter: {
      id: chapterId, label, name, place: text("2차 전직 통합 의뢰", "Tier-two integration mission"), npcName,
      retryScene: "promotion-chapter",
      successLine: text("하나의 단서를 되찾았어요. 다음 생물에게 배운 것을 이어 주세요!", "One clue is restored. Carry the lesson to the next creature!"),
      retryLine: text("단서를 다시 읽고 같은 의뢰에 도전해요.", "Read the clues again and retry this mission."),
      arena: { textureKey: `arena-${job}`, assetKey: `wallpapers/promotion/${job}-arena-v1.png` },
      stages: copies.map((copy, i) => ({
        id: ids[i], dexNumber: String(firstDex + i).padStart(3, "0"), level: i + 1,
        name: copy.name, classification: copy.concept, trait: copy.concept, description: copy.lesson,
        briefing: copy.challenge, preBattleLine: copy.lesson, snippet: text(copy.snippet, copy.snippet),
        textureKey: ids[i], assetKey: `monsters/${folder}/${ids[i].replace(/^(fullstack|ml|mlops|analytics)-/, "")}-lv${i + 1}-v1.png`,
        quizPackId: quizPackIdFor(chapterId, ids[i]),
      })),
    },
  };
}

export const ADDITIONAL_PROMOTION_MISSIONS = {
  "fullstack-engineer": mission("fullstack-engineer", "CH.24", 116, "ch24.fullstack", FULLSTACK_STAGE_IDS, "fullstack",
    text("이어진 두 마을", "The Linked Villages"), text("경계의 설계자 아라", "Boundary Architect Ara"),
    text("화면 마을과 서버 마을을 잇는 다리가 끊겼어요. 아라는 두 분야를 익힌 당신에게 다섯 생물과 함께 요청의 길을 복구해 달라고 부탁합니다.", "The bridge between the screen village and server village is broken. Ara asks you to unite both disciplines and restore the request journey with five creatures."),
    text("두 마을의 약속과 상태가 다시 이어졌어요. 아라는 당신을 풀스택 경로의 MASTER로 기록합니다. 작은 요청 하나도 끝까지 책임지는 모험가가 되었네요.", "Contracts and state connect the villages again. Ara records your mastery of the fullstack path. You now take responsibility for a request's whole journey."), [
      { name: text("약속 여우", "Contract Fox"), concept: text("API 계약과 호환성", "API contracts and compatibility"), lesson: text("입력·응답·오류 형식을 합의하고 양쪽에서 검증한다.", "Agree on input, response and error shapes, then validate both sides."), challenge: text("아라: 여우의 주문서가 서로 다르게 읽혀요. 화면과 서버의 필드·타입·오류 약속을 맞춰 주세요.", "Ara: The fox's order means different things on each bank. Align fields, types and errors between screen and server."), snippet: "request schema → validate → response contract" },
      { name: text("기억 수달", "Session Otter"), concept: text("요청 상태와 중복 방지", "Request state and deduplication"), lesson: text("화면 상태를 구분하고 같은 요청의 재시도가 중복 작업을 만들지 않게 한다.", "Distinguish UI states and prevent retries of the same request from duplicating work."), challenge: text("아라: 수달이 응답을 기다리다 주문을 두 번 보냈어요. 대기·실패·재시도의 흐름과 같은 요청을 알아보는 방법을 정해요.", "Ara: Waiting for a reply, the otter sent an order twice. Define pending, failure and retry states, and recognize the same request."), snippet: "idle → pending → success | error; retry(same key)" },
      { name: text("한묶음 천산갑", "Transaction Pangolin"), concept: text("일관된 변경과 트랜잭션", "Consistent updates and transactions"), lesson: text("함께 성공해야 하는 변경을 묶고 실패하면 부분 결과를 남기지 않는다.", "Group changes that must succeed together and avoid partial results on failure."), challenge: text("아라: 천산갑의 재고만 줄고 주문은 남지 않았어요. 한 묶음으로 끝나야 할 변경과 충돌 처리를 찾아요.", "Ara: Stock decreased but the pangolin's order vanished. Find the changes that must complete together and handle competing updates."), snippet: "begin → validate → update together → commit | rollback" },
      { name: text("발자취 제비", "Trace Swallow"), concept: text("화면부터 서버까지 추적", "Tracing from screen to server"), lesson: text("요청 식별자로 화면·API·저장소의 단서를 연결하고 민감한 값은 기록하지 않는다.", "Connect screen, API and storage clues with request identifiers while excluding sensitive values."), challenge: text("아라: 제비가 다리를 건너는 동안 응답이 느려졌어요. 같은 요청의 단서를 이어 병목을 찾아 주세요.", "Ara: The swallow's reply slowed while crossing the bridge. Connect evidence for the same request to locate the bottleneck."), snippet: "interaction → request ID → API spans → safe logs" },
      { name: text("다리 기린", "Bridge Kirin"), concept: text("통합 검증과 안전한 복구", "Integration checks and safe recovery"), lesson: text("실제 사용자 흐름과 실패 경로를 검증하고 호환되는 버전으로 안전하게 복구한다.", "Verify real user journeys and failure paths, then recover with compatible versions."), challenge: text("아라: 기린의 마지막 점검이에요. 계약·상태·변경·추적을 이어 두 마을의 주문이 끝까지 안전한지 증명해요.", "Ara: The kirin's final inspection joins contracts, state, updates and tracing. Prove orders travel safely through both villages."), snippet: "contract + state + consistency + traces → end-to-end check" },
    ]),
  "ml-developer": mission("ml-developer", "CH.25", 121, "ch25.ml-serving", ML_STAGE_IDS, "ml",
    text("예측의 온실", "The Prediction Greenhouse"), text("모델 조련사 유진", "Model Tamer Yujin"),
    text("온실의 예측이 새 씨앗 앞에서 빗나갑니다. 유진과 함께 데이터부터 추론 응답까지 살펴 다섯 생물이 다시 건강하게 자라도록 도와주세요.", "Greenhouse predictions fail on new seeds. Join Yujin to inspect data through inference responses and help five creatures thrive again."),
    text("새 씨앗도 검증된 길을 따라 자라요. 유진은 당신을 ML 개발 경로의 MASTER로 기록합니다. 모델의 점수와 서비스의 약속을 함께 지켰어요.", "New seeds follow a verified path. Yujin records your mastery of ML development. You upheld both model quality and the service's promises."), [
      { name: text("표본 생쥐", "Sample Mouse"), concept: text("대표 표본과 데이터 품질", "Representative samples and data quality"), lesson: text("대상 사용자를 대표하는 표본과 라벨을 확인하고 학습·평가 데이터를 구분한다.", "Check representative samples and labels, and separate training from evaluation data."), challenge: text("유진: 생쥐가 맑은 날의 씨앗만 모았어요. 비 오는 날에도 쓸 수 있는 표본인지 확인해요.", "Yujin: The mouse collected seeds only on sunny days. Check whether the sample supports rainy-day predictions too."), snippet: "population → sample → label checks → split" },
      { name: text("특징 사슴", "Feature Deer"), concept: text("학습·추론 특징 일치", "Training and serving feature parity"), lesson: text("학습 데이터에만 전처리를 적합하고 같은 변환과 특징 순서를 추론에도 사용한다.", "Fit preprocessing only on training data and reuse its transforms and feature order for inference."), challenge: text("유진: 사슴의 잎 크기를 학습 때와 다르게 재고 있어요. 같은 특징과 전처리로 맞춰 주세요.", "Yujin: The deer's leaves are measured differently at inference time. Restore consistent features and preprocessing."), snippet: "fit(train) → transform(train/test/serve)" },
      { name: text("검증 스라소니", "Validation Lynx"), concept: text("누수 없는 평가", "Leakage-free evaluation"), lesson: text("미래와 평가 데이터의 정보가 학습에 섞이지 않게 하고 목적에 맞는 지표를 고른다.", "Keep future and evaluation information out of training, and choose metrics suited to the task."), challenge: text("유진: 스라소니가 정답을 미리 본 듯 점수가 너무 높아요. 데이터 누수와 평가 기준을 점검해요.", "Yujin: The lynx scores as if it saw the answers. Check leakage and evaluation criteria."), snippet: "split → train → tune(validation) → final test" },
      { name: text("응답 도마뱀", "Serving Gecko"), concept: text("추론 계약과 지연", "Inference contracts and latency"), lesson: text("입력 형식·모델 버전·시간 제한을 명시하고 추론의 오류와 지연을 관측한다.", "Specify inputs, model versions and time limits, and observe inference errors and latency."), challenge: text("유진: 도마뱀은 가끔 늦거나 잘못된 잎을 받아요. 추론 서비스가 어떤 응답을 약속할지 정해요.", "Yujin: The gecko sometimes replies late or receives malformed leaves. Define the inference service's response contract."), snippet: "validate input → versioned predict → timeout/fallback" },
      { name: text("온실 그리핀", "Model Griffin"), concept: text("모델 서비스 통합 검증", "Integrated model-service verification"), lesson: text("모델 지표와 서비스 지표를 함께 검증하고 이전 버전으로 돌아갈 길을 준비한다.", "Verify model and service metrics together and prepare a path back to the previous version."), challenge: text("유진: 그리핀과 온실 전체를 점검해요. 표본·특징·평가·응답을 연결해 새 모델을 안전하게 내보내요.", "Yujin: Inspect the whole greenhouse with the griffin. Connect samples, features, evaluation and responses for a safe model release."), snippet: "data + features + evaluation + serving → guarded rollout" },
    ]),
  "mlops-engineer": mission("mlops-engineer", "CH.26", 126, "ch26.mlops", MLOPS_STAGE_IDS, "mlops",
    text("순환의 묘목장", "The Cycle Nursery"), text("모델 운영관 시우", "Model Steward Siwoo"),
    text("새 묘목이 나올 때마다 어제의 재배법이 사라져요. 시우와 다섯 생물을 도와 기록·재현·승격·관측의 순환을 복구해 주세요.", "Yesterday's growing recipe vanishes with each new sapling. Help Siwoo and five creatures restore lineage, reproducibility, promotion and observation."),
    text("어떤 씨앗과 재배법이 숲을 만들었는지 다시 알 수 있어요. 시우는 당신을 MLOps 경로의 MASTER로 기록합니다. 변화에 대응하는 안전한 순환이 돌아왔어요.", "The nursery can again trace each tree to its seeds and recipe. Siwoo records your MLOps mastery. A safe cycle can now respond to change."), [
      { name: text("기록 달팽이", "Lineage Snail"), concept: text("데이터·모델 계보", "Data and model lineage"), lesson: text("데이터 버전·코드·환경·실행과 결과 모델을 연결해 출처를 추적한다.", "Connect data versions, code, environments, runs and resulting models to trace provenance."), challenge: text("시우: 달팽이의 나이테가 어떤 씨앗에서 시작됐는지 사라졌어요. 모델의 출처를 되찾아요.", "Siwoo: The snail's growth rings no longer point to their seeds. Restore the model's provenance."), snippet: "data version + code + environment → run → model" },
      { name: text("흐름 비버", "Pipeline Beaver"), concept: text("재현 가능한 학습 흐름", "Reproducible training pipelines"), lesson: text("명시한 입력과 의존성으로 단계를 실행하고 재시도·검사·결과물을 관리한다.", "Run stages with explicit inputs and dependencies, managing retries, checks and artifacts."), challenge: text("시우: 비버의 물길은 같은 씨앗에도 매번 달라져요. 단계와 입력을 고정하고 실패를 다뤄요.", "Siwoo: The beaver's channels differ even for the same seeds. Pin stages and inputs, and handle failures."), snippet: "validate → prepare → train → evaluate → store" },
      { name: text("승격 거북", "Registry Tortoise"), concept: text("모델 등록과 버전 승격", "Model registration and version promotion"), lesson: text("검증한 버전을 식별하고 승인 기준을 통과한 모델만 서비스 대상으로 지정한다.", "Identify verified versions and point serving at models that pass approval criteria."), challenge: text("시우: 거북이 검증 전 묘목을 출하하려 해요. 버전·검사 기록·승격 기준을 확인해요.", "Siwoo: The tortoise is shipping unverified saplings. Check versions, evaluation records and promotion criteria."), snippet: "register version → evaluate → approve → update alias" },
      { name: text("변화 나방", "Drift Moth"), concept: text("변화 감지와 진단", "Drift detection and diagnosis"), lesson: text("입력 분포·품질·예측·실제 성능을 구분해 관측하고 변화의 원인을 조사한다.", "Observe input distributions, quality, predictions and actual performance separately, then investigate changes."), challenge: text("시우: 나방의 무늬가 달라졌지만 병든 것은 아닐 수도 있어요. 변화와 성능 저하를 구분해요.", "Siwoo: The moth's markings changed, but it may still be healthy. Distinguish distribution changes from performance loss."), snippet: "baseline → compare window → investigate → decide" },
      { name: text("순환 불사조", "Cycle Phoenix"), concept: text("안전한 재학습과 복구", "Safe retraining and recovery"), lesson: text("변화를 확인하고 새 모델을 검증해 점진 배포하며 이전 버전으로의 복구를 준비한다.", "Confirm changes, validate retrained models, roll out gradually and prepare previous-version recovery."), challenge: text("시우: 불사조가 새 순환을 시작해요. 기록·흐름·승격·변화 감지를 이어 안전하게 다시 자라도록 해요.", "Siwoo: The phoenix begins a new cycle. Join lineage, pipelines, promotion and drift checks for safe renewal."), snippet: "observe → investigate → retrain → evaluate → canary/rollback" },
    ]),
  "analytics-engineer": mission("analytics-engineer", "CH.27", 131, "ch27.analytics", ANALYTICS_STAGE_IDS, "analytics",
    text("지표의 천문대", "The Metrics Observatory"), text("지표 번역가 소라", "Metric Interpreter Sora"),
    text("같은 별을 세어도 마을마다 숫자가 달라요. 소라와 다섯 생물을 도와 데이터의 단위·품질·정의·계보를 맞추고 믿을 수 있는 지도를 만드세요.", "Villages count the same stars differently. Help Sora and five creatures align grain, quality, definitions and lineage to build a trustworthy map."),
    text("누구나 같은 정의로 별을 셀 수 있어요. 소라는 당신을 Analytics 경로의 MASTER로 기록합니다. 숫자의 출처와 뜻을 함께 설명할 수 있게 되었어요.", "Everyone can count stars using the same definitions. Sora records your analytics mastery. You can now explain both a number's origin and meaning."), [
      { name: text("한알 참새", "Grain Sparrow"), concept: text("테이블 단위와 키", "Table grain and keys"), lesson: text("한 행이 뜻하는 단위를 정하고 키·조인 관계로 중복 집계를 막는다.", "Define what one row represents and use keys and join relationships to prevent double counting."), challenge: text("소라: 참새의 한 알이 주문인지 주문 항목인지 모호해요. 행의 단위와 조인 배수를 맞춰요.", "Sora: Does one grain mean an order or an order item? Define row grain and join multiplicity."), snippet: "one row = one entity/event; join at matching grain" },
      { name: text("맑음 개구리", "Quality Frog"), concept: text("데이터 검사와 신선도", "Data tests and freshness"), lesson: text("유일성·빈 값·참조·허용 값과 갱신 시점을 검사해 신뢰 조건을 드러낸다.", "Test uniqueness, nulls, references, accepted values and update times to expose trust conditions."), challenge: text("소라: 개구리 연못의 새 데이터가 늦고 중복도 보여요. 어떤 검사로 신뢰를 확인할까요?", "Sora: The frog's pond receives late and duplicate data. Which checks establish trust?"), snippet: "unique + not_null + relationships + freshness" },
      { name: text("기준 초롱물고기", "Metric Lanternfish"), concept: text("일관된 지표 정의", "Consistent metric definitions"), lesson: text("분자·분모·필터·시간대·집계 단위를 명시해 같은 질문에 같은 숫자를 만든다.", "Specify numerator, denominator, filters, timezone and aggregation grain for consistent answers."), challenge: text("소라: 물고기의 등불마다 전환율이 달라요. 계산의 범위와 시간을 같은 말로 정해요.", "Sora: Each lantern shows a different conversion rate. Agree on calculation scope and time."), snippet: "metric = definition + grain + filters + time window" },
      { name: text("계보 사슴", "Lineage Stag"), concept: text("의존성과 변경 영향", "Dependencies and change impact"), lesson: text("원천부터 모델과 대시보드까지 의존성을 이어 변경이 영향을 줄 곳을 확인한다.", "Trace source-to-model-to-dashboard dependencies to identify where changes have impact."), challenge: text("소라: 사슴의 가지 하나를 바꾸면 여러 별자리가 흔들려요. 하위 모델과 사용자 영향을 찾아요.", "Sora: Changing one antler branch shakes several constellations. Find downstream models and affected users."), snippet: "source → staging → model → metric → dashboard" },
      { name: text("통찰 수호룡", "Insight Dragon"), concept: text("신뢰할 수 있는 분석 배포", "Trusted analytical delivery"), lesson: text("단위·검사·정의·계보를 함께 검증하고 과거 재처리와 변경 결과를 확인한다.", "Verify grain, tests, definitions and lineage together, including historical recomputation and change results."), challenge: text("소라: 수호룡의 마지막 별지도예요. 네 단서를 이어 대시보드의 숫자를 설명하고 안전하게 배포해요.", "Sora: The guardian's final star map joins all four clues. Explain the dashboard's numbers and deliver them safely."), snippet: "grain + tests + metrics + lineage → verified delivery" },
    ]),
} satisfies Record<Exclude<SecondaryJobId, "platform-engineer">, PromotionMission>;
