import { createEmptySave, type StoredCareerMilestone, type StoredGameStateV3 } from "./schema";

export type SelectionField = keyof StoredGameStateV3["player"];
export interface SaveMerge { save: StoredGameStateV3; conflicts: SelectionField[] }

function earliest(a?: string, b?: string): string | undefined {
  const valid = [a, b].filter((value): value is string => !!value && Number.isFinite(Date.parse(value)));
  return valid.sort((x, y) => Date.parse(x) - Date.parse(y))[0];
}

/** Collections converge; concurrent career selections require an explicit decision. */
export function mergeSaves(local: StoredGameStateV3, remote: StoredGameStateV3, base: StoredGameStateV3 = createEmptySave(), resolve?: "local" | "remote"): SaveMerge {
  const captures = new Map<string, string>();
  for (const entry of [...local.progress.captures, ...remote.progress.captures]) {
    const time = earliest(captures.get(entry.id), entry.capturedAt);
    if (time) captures.set(entry.id, time);
  }
  const careers = new Map<string, StoredCareerMilestone>();
  for (const entry of [...local.progress.careers, ...remote.progress.careers]) {
    const before = careers.get(entry.id);
    const unlockedAt = earliest(before?.unlockedAt, entry.unlockedAt);
    if (!unlockedAt) continue;
    careers.set(entry.id, { id: entry.id, unlockedAt, selectedAt: earliest(before?.selectedAt, entry.selectedAt), masteredAt: earliest(before?.masteredAt, entry.masteredAt) });
  }
  const player = { ...remote.player };
  const conflicts: SelectionField[] = [];
  for (const field of Object.keys(player) as SelectionField[]) {
    const a = local.player[field], b = remote.player[field], previous = base.player[field];
    if (a === b || b === previous) player[field] = a as never;
    else if (a === previous) player[field] = b as never;
    else {
      conflicts.push(field);
      player[field] = (resolve === "local" ? a : b) as never;
    }
  }
  return { conflicts, save: {
    version: 3,
    progress: { captures: [...captures].sort(([a], [b]) => a.localeCompare(b)).map(([id, capturedAt]) => ({ id, capturedAt })), careers: [...careers.values()].sort((a, b) => a.id.localeCompare(b.id)) },
    player,
    ui: { ...remote.ui, ...local.ui,
      locale: local.ui.locale === base.ui.locale ? remote.ui.locale : local.ui.locale ?? remote.ui.locale,
      checkpointId: local.ui.checkpointId === base.ui.checkpointId ? remote.ui.checkpointId : local.ui.checkpointId ?? remote.ui.checkpointId,
      tutorialOnboardingSeen: local.ui.tutorialOnboardingSeen || remote.ui.tutorialOnboardingSeen },
  } };
}
