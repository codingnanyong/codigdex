import { text } from "@codigdex/game-core/i18n/locale";
import { quizPackIdFor } from "@codigdex/game-core/domain/dex/quiz";
import type { ChapterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { PLATFORM_STAGE_IDS } from "./promotionIds";
import { ADDITIONAL_PROMOTION_MISSIONS, type PromotionMission } from "./additionalPromotionChapters";
import type { SecondaryJobId } from "./player/jobs";

export const PLATFORM_CHAPTER_ART = {
  arena: "wallpapers/promotion/platform-engineer-arena-v1.png",
  guide: "characters/promotion/platform-engineer/guide-v1.png",
} as const;

const stageCopy = [
  {
    name: text("보따리 소라게", "Parcel Hermit"),
    concept: text("검증된 배포 경로", "Verified release paths"),
    description: text("같은 빌드 결과물을 테스트하고 배포해 환경마다 다른 배가 출항하지 않도록 지킨다.", "Tests and deploys the same artifact so each environment receives the same ship."),
    snippet: "build → test → immutable artifact → deploy → verify",
    briefing: text("준: 항구의 배포 다리가 끊겼어요. 소라게가 안전하게 보따리를 옮기도록 빌드·테스트·배포 순서를 복구해 주세요.", "Jun: The release bridge is broken. Restore build, test and delivery so the hermit can carry its parcel safely."),
    line: text("실패한 검사를 건너뛰지 말고, 검증한 결과물을 그대로 보내세요.", "Keep failed checks blocking, and ship the artifact you actually tested."),
    art: "release-ferry-lv1-v2.png",
  },
  {
    name: text("메아리 부엉이", "Echo Owl"),
    concept: text("관측과 원인 추적", "Observability and diagnosis"),
    description: text("지표·로그·추적을 함께 읽어 느려진 항로의 원인을 찾아낸다.", "Reads metrics, logs and traces together to find why a route is slowing down."),
    snippet: "request → trace → spans; metrics + logs + traces",
    briefing: text("준: 다리는 열렸지만 등대의 신호가 뒤섞였어요. 부엉이의 메아리를 따라 요청이 느려지는 지점을 찾아봐요.", "Jun: The bridge is open, but beacon signals are tangled. Follow the owl's echoes to locate the slow request."),
    line: text("경보 하나만 믿기보다 같은 요청의 여러 단서를 이어 보세요.", "Connect several clues from the same request instead of trusting one alert."),
    art: "signal-owl-lv2-v2.png",
  },
  {
    name: text("약속등 거북", "Promise Turtle"),
    concept: text("SLO와 오류 예산", "SLOs and error budgets"),
    description: text("사용자가 느끼는 성공을 측정하고 목표와 남은 오류 예산으로 배포 속도를 조절한다.", "Measures user-visible success and uses objectives and remaining error budget to pace changes."),
    snippet: "SLI = good events / valid events; error budget = 1 − SLO",
    briefing: text("준: 모든 경보를 없애려다 배가 한 척도 못 떠나요. 거북과 함께 사용자에게 지킬 약속과 위험을 감수할 범위를 정해 주세요.", "Jun: Trying to eliminate every alert has stopped all departures. Help the turtle set a promise to users and a sensible allowance for failure."),
    line: text("목표는 100%라는 숫자보다 사용자의 경험에서 출발해요.", "Start with the user's experience rather than an automatic goal of 100%."),
    art: "budget-keeper-lv3-v2.png",
  },
  {
    name: text("길잡이 왜가리", "Wayfinder Heron"),
    concept: text("장애 완화와 협업", "Incident mitigation and coordination"),
    description: text("영향을 줄이는 조치를 먼저 수행하고 역할·상황 기록·소통으로 복구를 이끈다.", "Reduces user impact first, then guides recovery through clear roles, notes and communication."),
    snippet: "detect → declare → mitigate → communicate → recover",
    briefing: text("준: 폭풍 때문에 새 항로가 멈췄어요. 왜가리와 함께 영향을 줄이고, 누가 무엇을 할지 나눠 구조선을 이끌어 주세요.", "Jun: A storm has stopped the new route. Help the heron reduce the impact, divide the work and guide the rescue."),
    line: text("먼저 피해를 줄이고, 원인 조사는 복구와 분리해서 이어가요.", "Reduce the harm first; continue root-cause analysis separately from recovery."),
    art: "incident-heron-lv4-v2.png",
  },
  {
    name: text("항구 수호룡", "Harbor Wyrm"),
    concept: text("복구 검증과 재발 방지", "Recovery verification and prevention"),
    description: text("대표 요청과 관측 신호로 회복을 확인하고 학습·개선으로 다음 항해를 더 안전하게 만든다.", "Verifies recovery with representative requests and signals, then improves the next voyage through learning."),
    snippet: "verify user journeys → observe → learn → test improvements",
    briefing: text("준: 마지막으로 수호룡이 항구를 점검해요. 배포·신호·약속·장애 대응을 이어서 복구를 증명하면 플랫폼 경로의 MASTER가 됩니다.", "Jun: The guardian makes one final inspection. Connect releases, signals, objectives and incident response to prove recovery and master this platform path."),
    line: text("등불 하나가 켜졌다고 끝이 아니에요. 사용자가 다시 항해할 수 있는지 확인해요.", "One green light is not the finish. Check that users can really sail again."),
    art: "harbor-guardian-lv5-v2.png",
  },
];

export const PLATFORM_PROMOTION_CHAPTER: ChapterDefinition = {
  id: "promotion:platform-engineer", label: "CH.23",
  name: text("신뢰의 항구", "Harbor of Reliability"),
  place: text("플랫폼 · SRE 통합 의뢰", "Platform · SRE field mission"),
  npcName: text("플랫폼 항해사 준", "Platform Navigator Jun"),
  successLine: text("항로가 하나 더 돌아왔어요. 모은 단서를 이어 다음 구역으로 가요!", "Another route is restored. Carry what you learned to the next part of the harbor!"),
  retryLine: text("서두르지 않아도 괜찮아요. 단서를 다시 읽고 같은 구역에서 재도전해요.", "There is no rush. Read the clues again and retry this part of the harbor."),
  retryScene: "promotion-chapter",
  arena: { textureKey: "arena-platform-harbor", assetKey: PLATFORM_CHAPTER_ART.arena },
  stages: stageCopy.map((copy, index) => ({
    id: PLATFORM_STAGE_IDS[index], dexNumber: String(111 + index).padStart(3, "0"), level: index + 1,
    name: copy.name, classification: copy.concept, trait: copy.concept, description: copy.description,
    snippet: text(copy.snippet, copy.snippet), briefing: copy.briefing, preBattleLine: copy.line,
    textureKey: PLATFORM_STAGE_IDS[index], assetKey: `monsters/ch23.platform-sre/${copy.art}`,
    quizPackId: quizPackIdFor("promotion:platform-engineer", PLATFORM_STAGE_IDS[index]),
  })),
};

export const PLATFORM_STORY = {
  intro: text("배포가 멈춘 신뢰의 항구. 준은 두 분야를 익힌 당신에게 항로 복구를 부탁합니다. 다섯 수호 생물과 함께 안전한 출항을 되찾아 주세요.", "Releases have stopped at the Harbor of Reliability. Jun asks you to unite your two disciplines and restore safe departures alongside five guardian creatures."),
  ending: text("항구에 다시 배가 드나들어요. 준은 당신을 플랫폼 경로의 MASTER로 기록합니다. 오늘의 약속과 복구 경험이 다음 모험의 기반이 됩니다.", "Ships return to the harbor. Jun records your mastery of the platform path. Today's promises and recovery lessons become the foundation for your next adventure."),
};

export const PROMOTION_MISSIONS: Readonly<Record<SecondaryJobId, PromotionMission>> = {
  "platform-engineer": { chapter: PLATFORM_PROMOTION_CHAPTER, story: PLATFORM_STORY, scenery: "platform", guideAssetKey: PLATFORM_CHAPTER_ART.guide },
  ...ADDITIONAL_PROMOTION_MISSIONS,
};
export const PROMOTION_CHAPTERS = Object.values(PROMOTION_MISSIONS).map(({ chapter }) => chapter);

export function promotionMissionFor(jobId: string | null | undefined): PromotionMission | undefined {
  return jobId && Object.hasOwn(PROMOTION_MISSIONS, jobId) ? PROMOTION_MISSIONS[jobId as SecondaryJobId] : undefined;
}
export function promotionChapterFor(jobId: string | null | undefined): ChapterDefinition | undefined {
  return promotionMissionFor(jobId)?.chapter;
}
