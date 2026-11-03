import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import type { SourceEventSession } from "../openSourceEvents";
import type { CaptureReturnTarget } from "./resultFlow";

type CaptureSceneTarget = CaptureReturnTarget | { scene: "open-source-event"; data?: { view: "region" } }
  | { scene: "code-battle"; data: { monsterId: string; sourceEventId: string; returnTo: CaptureReturnTarget } };
interface ConfirmCaptureContext {
  save: StoredGameStateV3;
  beforeCapture?: StoredGameStateV3;
  monsterId: string;
  fallback: CaptureReturnTarget;
  sourceEventId?: string;
  victoryId?: string;
}

/** Commit the encounter transition once, then let the scene perform only navigation. */
export function confirmCaptureTarget(context: ConfirmCaptureContext, events: Pick<SourceEventSession, "completeStage" | "queue">): CaptureSceneTarget {
  const { save, beforeCapture, monsterId, fallback, sourceEventId, victoryId } = context;
  if (sourceEventId) {
    const completed = events.completeStage(save, sourceEventId, monsterId);
    return completed?.kind === "next" ? { scene: "code-battle", data: { monsterId: completed.stage.id, sourceEventId, returnTo: completed.returnTo } } : completed?.returnTo ?? fallback;
  }
  if (beforeCapture && events.queue(beforeCapture, save, monsterId, fallback, Math.random, victoryId)) {
    return { scene: "open-source-event" };
  }
  return fallback;
}

export function retryCaptureTarget(sourceEventId: string | undefined, fallback: CaptureReturnTarget): CaptureSceneTarget {
  return sourceEventId ? { scene: "open-source-event", data: { view: "region" } } : fallback;
}
