import type { BattleState } from "../domain/dex/battle";
import { isSuccessfulCapture } from "../domain/dex/capture";
import type { StoredGameStateV3 } from "./schema";

/** Settles a successful battle once; retries preserve the original capture time and all other progress. */
export function applyBattleCapture(
  save: StoredGameStateV3,
  monsterId: string,
  battle: BattleState,
  now: () => string = () => new Date().toISOString()
): StoredGameStateV3 {
  if (battle.status !== "passed" || !isSuccessfulCapture(battle.correctCount, battle.questions.length) ||
    save.progress.captures.some(({ id }) => id === monsterId)) return save;
  return {
    ...save,
    progress: {
      ...save.progress,
      captures: [...save.progress.captures, { id: monsterId, capturedAt: now() }],
    },
  };
}
