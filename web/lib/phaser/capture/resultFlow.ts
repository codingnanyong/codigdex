import { unlockAfter } from "@codigdex/game-content/domain/chapters";
import type { SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";

export type CaptureReturnTarget = SourceReturnTarget;

export interface CaptureSuccessFlow {
  regionCleared: boolean;
  careerCleared: boolean;
  target: CaptureReturnTarget;
}

/** Career completion takes priority; otherwise a cleared region exits to its atlas. */
export function resolveCaptureSuccessFlow(
  monsterId: string,
  isNewEntry: boolean,
  fallback: CaptureReturnTarget,
  { careerCleared = false, sourceEventId }: { careerCleared?: boolean; sourceEventId?: string } = {}
): CaptureSuccessFlow {
  if (sourceEventId) return { regionCleared: false, careerCleared: false, target: fallback };
  const regionCleared = isNewEntry && unlockAfter(monsterId).kind === "career-region-complete";
  return {
    regionCleared,
    careerCleared,
    target: careerCleared
      ? { scene: "job-select" }
      : regionCleared
        ? fallback.scene === "promotion-chapter" ? fallback : { scene: "world-map" }
        : fallback,
  };
}
