import { unlockAfter } from "@codigdex/game-content/domain/chapters";

export type CaptureReturnTarget = {
  scene: "world-map" | "job-select" | "career-region";
  data?: Record<string, unknown>;
};

export interface CaptureSuccessFlow {
  regionCleared: boolean;
  target: CaptureReturnTarget;
}

/** A newly completed career region exits to its atlas; retries and replays keep their requested return. */
export function resolveCaptureSuccessFlow(
  monsterId: string,
  isNewEntry: boolean,
  fallback: CaptureReturnTarget
): CaptureSuccessFlow {
  const regionCleared = isNewEntry && unlockAfter(monsterId).kind === "career-region-complete";
  return {
    regionCleared,
    target: regionCleared ? { scene: "world-map" } : fallback,
  };
}
