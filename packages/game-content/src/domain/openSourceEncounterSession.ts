import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { nextOpenSourceEvolution, sourceEncounterStage, openSourceEvolutionCount } from "./openSourceChapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { canEnterBattle } from "./gameProgress";
import { openSourceIdentity } from "./openSourceEvolutionIds";
import { activeSourceCareer, emptyEncounterHistory, planSourceEncounter, type SourceEncounter, type SourceEncounterHistory, type SourceReturnTarget } from "./openSourceEncounters";
import { parseEncounterHistory, sourceEventStorageKey, type EncounterStorage } from "./openSourceEncounterStorage";
import { careerPathFor } from "./careerPaths";
import { monstersForCareerRegion } from "./careerRegionMonsters";
import { secondaryRegionsFor } from "./secondaryExploration";
import { JOB_OPTIONS } from "./player/jobs";
import { encounterTools } from "./openSourceEncounters";

export type SourceStageCompletion = { kind: "next"; stage: MonsterDefinition; returnTo: SourceReturnTarget } | { kind: "complete"; returnTo: SourceReturnTarget };

export class SourceEventSession {
  private key?: string;
  private history = emptyEncounterHistory();
  constructor(private readonly storage?: EncounterStorage, private readonly notify: () => void = () => undefined) {}

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

  /** Query only: no storage writes or notifications. */
  pending(save: StoredGameStateV3): SourceEncounter | undefined {
    const pending = this.read(save).pending;
    if (!pending) return;
    if (activeSourceCareer(save) !== pending.careerId || !save.progress.captures.some(({ id, capturedAt }) => id === pending.triggerId && capturedAt === pending.triggerAt) || pending.id !== `${pending.careerId}:${pending.triggerId}:${pending.victoryId ?? pending.triggerAt}`) {
      return;
    }
    return pending;
  }

  /** Explicitly discard stale state when resuming or changing an encounter. */
  resolvePending(save: StoredGameStateV3, recoverCaptured = true) {
    const pending = this.pending(save);
    if (!pending && this.history.pending) this.write(save, { ...this.history, pending: undefined });
    if (recoverCaptured && pending && openSourceEvolutionCount(save, pending.toolId) === 5) { this.finish(save, pending.id); return undefined; }
    if (recoverCaptured && pending?.state === "active") {
      const stage = sourceEncounterStage(save, pending);
      if (pending.stageId && !canEnterBattle(save, pending.stageId)) {
        // History and captures have separate storage writes. If history landed
        // first, resume from the first missing capture rather than a locked form.
        const next = nextOpenSourceEvolution(save, pending.toolId);
        if (next) this.write(save, { ...this.history, pending: { ...pending, stageId: next.id } });
      } else if (stage && save.progress.captures.some(({ id }) => id === stage.id)) this.completeStage(save, pending.id, stage.id);
    } else if (recoverCaptured && pending?.state === "paused") {
      if (openSourceEvolutionCount(save, pending.toolId) === 5) this.finish(save, pending.id);
      else {
        const next = nextOpenSourceEvolution(save, pending.toolId);
        if (next && next.id !== pending.stageId) this.write(save, { ...this.history, pending: { ...pending, stageId: next.id } });
      }
    }
    return this.pending(save);
  }

  queue(before: StoredGameStateV3, after: StoredGameStateV3, triggerId: string, target: SourceReturnTarget, random = Math.random, victoryId?: string) {
    this.resolvePending(after);
    const history = this.read(after);
    const next = planSourceEncounter(before, after, triggerId, target, history, random, victoryId);
    if (next !== history) this.write(after, next);
    const pending = this.pending(after);
    return pending?.state === "paused" ? undefined : pending;
  }

  accept(save: StoredGameStateV3, id: string) {
    const pending = this.resolvePending(save);
    if (!pending || pending.id !== id) return false;
    const stage = pending.state === "offered" ? nextOpenSourceEvolution(save, pending.toolId) : sourceEncounterStage(save, pending);
    if (!stage) return false;
    this.write(save, { ...this.history, pending: { ...pending, state: "active", ...(pending.state === "offered" || pending.stageId ? { stageId: stage.id } : {}) } });
    return true;
  }

  finish(save: StoredGameStateV3, id: string) {
    const pending = this.pending(save);
    if (!pending || pending.id !== id) return;
    this.write(save, { ...this.history, pending: undefined });
    return pending.returnTo;
  }

  /** Reopen only a discovered, unfinished tool belonging to the current career. */
  resumeDiscovered(save: StoredGameStateV3, toolId: string) {
    const current = this.resolvePending(save);
    if (current) return current.toolId === toolId ? current : undefined;
    const careerId = activeSourceCareer(save);
    const history = this.read(save);
    if (!careerId || !history.discoveries.some(item => item.careerId === careerId && item.toolId === toolId)
      || !encounterTools(careerId).some(tool => tool.id === toolId)) return;
    const stage = nextOpenSourceEvolution(save, toolId);
    if (!stage) return;
    const secondary = secondaryRegionsFor(careerId);
    const primary = JOB_OPTIONS.find(job => job.id === careerId);
    if (!secondary.length && !primary) return;
    const regions = secondary.length ? secondary.map(region => ({ id: region.id, monsters: region.chapter.stages }))
      : careerPathFor(primary!.id).regions.map(region => ({ id: region.id, monsters: monstersForCareerRegion(region.id) }));
    const capture = [...save.progress.captures].reverse().find(item => regions.some(region => region.monsters.some(monster => monster.id === item.id)));
    if (!capture) return;
    const region = regions.find(region => region.monsters.some(monster => monster.id === capture.id))!;
    const returnTo: SourceReturnTarget = secondary.length ? { scene: "secondary-atlas", data: { jobId: careerId } }
      : { scene: "career-region", data: { careerId, regionId: region.id } };
    const pending: SourceEncounter = { id: `${careerId}:${capture.id}:${capture.capturedAt}`, careerId, toolId,
      triggerId: capture.id, triggerAt: capture.capturedAt, stageId: stage.id, state: "paused", returnTo };
    this.write(save, { ...history, pending });
    return pending;
  }

  /** Settle one captured form and retain the same request through all five forms. */
  completeStage(save: StoredGameStateV3, id: string, monsterId: string): SourceStageCompletion | undefined {
    const pending = this.pending(save);
    if (!pending || pending.id !== id || !save.progress.captures.some(({ id }) => id === monsterId)) return;
    if (!this.canBattle(save, id, monsterId)) {
      const current = sourceEncounterStage(save, pending);
      // A repeated result tap must keep the already-selected next battle.
      if (pending.state === "active" && current && openSourceIdentity(monsterId)?.toolId === pending.toolId &&
        !save.progress.captures.some(({ id }) => id === current.id) && canEnterBattle(save, current.id)) return { kind: "next", stage: current, returnTo: pending.returnTo };
      return;
    }
    if (openSourceEvolutionCount(save, pending.toolId) === 5) {
      this.finish(save, id);
      return { kind: "complete", returnTo: pending.returnTo };
    }
    const next = nextOpenSourceEvolution(save, pending.toolId);
    if (!next) return;
    this.write(save, { ...this.history, pending: { ...pending, state: "active", stageId: next.id } });
    return { kind: "next", stage: next, returnTo: pending.returnTo };
  }

  /** Before acceptance this declines; after acceptance it pauses the same run. */
  leave(save: StoredGameStateV3, id: string) {
    const pending = this.pending(save);
    if (!pending || pending.id !== id) return;
    if (pending.state === "offered") return this.finish(save, id);
    return this.pause(save, id);
  }

  /** Returning to a career keeps even a not-yet-accepted offer available. */
  pause(save: StoredGameStateV3, id: string) {
    const pending = this.pending(save);
    if (!pending || pending.id !== id) return;
    const target = pending.returnTo;
    if (openSourceEvolutionCount(save, pending.toolId) === 5) return this.finish(save, id);
    const next = nextOpenSourceEvolution(save, pending.toolId);
    // One durable history write records both the next form and the pause.
    this.write(save, { ...this.history, pending: { ...pending, state: "paused", ...(next ? { stageId: next.id } : {}) } });
    return target;
  }

  canBattle(save: StoredGameStateV3, id: string | undefined, monsterId: string) {
    const pending = this.pending(save);
    return !!id && pending?.id === id && pending.state === "active" && monsterId === sourceEncounterStage(save, pending)?.id &&
      (!pending.stageId || canEnterBattle(save, monsterId));
  }
}
