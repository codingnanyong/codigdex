import type Phaser from "phaser";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { activeSourceCareer, emptyEncounterHistory, encounterTools, planSourceEncounter, sourceCareer, type SourceEncounter, type SourceEncounterHistory, type SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";

export const SOURCE_EVENTS_CHANGED = "codigdex-source-events-changed";
const prefix = "codigdex:source-events:v1:";
const normalScenes = new Set(["world-map", "job-select", "career-region", "promotion-chapter"]);
type IO = Pick<Storage, "getItem" | "setItem">;

/** Cosmetic encounter history is local to this adventure; game cards stay in save v3. */
export function sourceEventStorageKey(save: StoredGameStateV3) {
  const first = save.progress.captures.find(({ id }) => id === CHAPTERS[0].stages[0].id);
  return first && first.capturedAt.length <= 64 ? prefix + first.capturedAt : undefined;
}

function returnTarget(value: unknown): SourceReturnTarget | undefined {
  if (!value || typeof value !== "object") return;
  const target = value as Record<string, unknown>;
  if (typeof target.scene !== "string" || !normalScenes.has(target.scene)) return;
  const data = target.data && typeof target.data === "object" ? Object.fromEntries(Object.entries(target.data).filter(([key, value]) => ["careerId", "regionId", "jobId", "monsterId", "focusChapterId"].includes(key) && typeof value === "string" && value.length <= 128)) : undefined;
  return { scene: target.scene as SourceReturnTarget["scene"], ...(data ? { data } : {}) };
}

export function parseEncounterHistory(raw: string | null): SourceEncounterHistory {
  const result = emptyEncounterHistory();
  if (!raw || raw.length > 128000) return result;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object") return result;
    result.processed = Array.isArray(value.processed) ? value.processed.filter((id: unknown): id is string => typeof id === "string" && id.length <= 400).slice(-256) : [];
    result.offeredCareers = Array.isArray(value.offeredCareers) ? [...new Set(value.offeredCareers.filter((id: unknown) => typeof id === "string" && sourceCareer(id)))] as SourceEncounterHistory["offeredCareers"] : [];
    result.sinceOffer = Number.isSafeInteger(value.sinceOffer) && value.sinceOffer >= 0 ? Math.min(256, value.sinceOffer) : 0;
    if (Array.isArray(value.discoveries)) result.discoveries = value.discoveries.filter((item: Record<string, unknown>) => item && typeof item.toolId === "string" && typeof item.careerId === "string" && sourceCareer(item.careerId) && encounterTools(item.careerId as SourceEncounter["careerId"]).some(({ id }) => id === item.toolId)).slice(-380);
    const pending = value.pending;
    const target = returnTarget(pending?.returnTo);
    if (pending && target && typeof pending.id === "string" && pending.id.length <= 400 && typeof pending.toolId === "string" && sourceCareer(pending.careerId) && encounterTools(pending.careerId).some(({ id }) => id === pending.toolId) && typeof pending.triggerId === "string" && pending.triggerId.length <= 128 && typeof pending.triggerAt === "string" && pending.triggerAt.length <= 64 && ["offered", "active"].includes(pending.state)) {
      result.pending = { id: pending.id, careerId: pending.careerId, toolId: pending.toolId, triggerId: pending.triggerId, triggerAt: pending.triggerAt, ...(typeof pending.victoryId === "string" && pending.victoryId.length <= 128 ? { victoryId: pending.victoryId } : {}), state: pending.state, returnTo: target };
    }
  } catch { /* Broken preference storage must not break the adventure. */ }
  return result;
}

export class SourceEventSession {
  private key?: string;
  private history = emptyEncounterHistory();
  constructor(private readonly storage?: IO, private readonly notify: () => void = () => undefined) {}

  read(save: StoredGameStateV3): SourceEncounterHistory {
    const key = sourceEventStorageKey(save);
    if (key !== this.key) {
      this.key = key;
      try { this.history = parseEncounterHistory(key ? this.storage?.getItem(key) ?? null : null); }
      catch { this.history = emptyEncounterHistory(); }
    }
    return this.history;
  }

  private write(save: StoredGameStateV3, history: SourceEncounterHistory) {
    this.read(save);
    this.history = history;
    try { if (this.key) this.storage?.setItem(this.key, JSON.stringify(history)); } catch { /* Keep this session usable when storage is unavailable. */ }
    this.notify();
  }

  pending(save: StoredGameStateV3): SourceEncounter | undefined {
    const pending = this.read(save).pending;
    if (!pending) return;
    if (activeSourceCareer(save) !== pending.careerId || !save.progress.captures.some(({ id, capturedAt }) => id === pending.triggerId && capturedAt === pending.triggerAt) || pending.id !== `${pending.careerId}:${pending.triggerId}:${pending.victoryId ?? pending.triggerAt}`) {
      this.write(save, { ...this.history, pending: undefined });
      return;
    }
    return pending;
  }

  queue(before: StoredGameStateV3, after: StoredGameStateV3, triggerId: string, target: SourceReturnTarget, random = Math.random, victoryId?: string) {
    this.pending(after);
    const history = this.read(after);
    const next = planSourceEncounter(before, after, triggerId, target, history, random, victoryId);
    if (next !== history) this.write(after, next);
    return this.pending(after);
  }

  accept(save: StoredGameStateV3, id: string) {
    const pending = this.pending(save);
    if (!pending || pending.id !== id) return false;
    this.write(save, { ...this.history, pending: { ...pending, state: "active" } });
    return true;
  }

  finish(save: StoredGameStateV3, id: string) {
    const pending = this.pending(save);
    if (!pending || pending.id !== id) return;
    this.write(save, { ...this.history, pending: undefined });
    return pending.returnTo;
  }

  canBattle(save: StoredGameStateV3, id: string | undefined, monsterId: string) {
    const pending = this.pending(save);
    return !!id && pending?.id === id && pending.state === "active" && monsterId === `open-source:${pending.toolId}`;
  }
}

const sessions = new WeakMap<Phaser.Data.DataManager, SourceEventSession>();
export function sourceEvents(registry: Phaser.Data.DataManager) {
  let session = sessions.get(registry);
  if (!session) {
    let storage: IO | undefined;
    try { if (typeof window !== "undefined") storage = window.localStorage; } catch { /* Optional local event history. */ }
    session = new SourceEventSession(storage, () => { if (typeof window !== "undefined") window.dispatchEvent(new Event(SOURCE_EVENTS_CHANGED)); });
    sessions.set(registry, session);
  }
  return session;
}

export function discoveredSourceIds(registry: Phaser.Data.DataManager, save: StoredGameStateV3) {
  return new Set([...sourceEvents(registry).read(save).discoveries.map(({ toolId }) => toolId), ...save.progress.captures.filter(({ id }) => id.startsWith("open-source:")).map(({ id }) => id.slice("open-source:".length))]);
}
