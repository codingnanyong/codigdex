import { text } from "@/lib/i18n/locale";
import { CAREER_REGION_MONSTERS } from "../careerRegionMonsters";
import { careerQuizProfile } from "../careerMonsterQuizzes";
import type { ChapterDefinition } from "./types";

/** Battle definitions for career maps; world progression still uses only the common chapters. */
export const CAREER_CHAPTERS: readonly ChapterDefinition[] = Object.entries(
  CAREER_REGION_MONSTERS
).map(([technologyId, stages], index) => {
  const profile = careerQuizProfile(technologyId);
  return {
    id: `career:${technologyId}`,
    label: `CH.${String(index + 3).padStart(2, "0")}`,
    name: profile.name,
    place: text("커리어 수련장", "Career training ground"),
    npcName: text("커리어 가이드", "Career Guide"),
    successLine: text(
      "좋아요! 다음 체크포인트로 이동할 수 있어요.",
      "Well done! You can move on to the next checkpoint."
    ),
    retryLine: text(
      "핵심 개념을 다시 살펴보고 재도전해 보세요.",
      "Review the core concept and try again."
    ),
    retryScene: "career-region" as const,
    stages,
  } satisfies ChapterDefinition;
});
