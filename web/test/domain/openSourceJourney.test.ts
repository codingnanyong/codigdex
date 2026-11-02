import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { SOURCE_CAREERS, encounterTools, emptyEncounterHistory, type SourceEncounter } from "@codigdex/game-content/domain/openSourceEncounters";
import { SourceEventSession } from "@codigdex/game-content/domain/openSourceEncounterSession";
import { sourceEventStorageKey, parseEncounterHistory } from "@codigdex/game-content/domain/openSourceEncounterStorage";
import { openSourceEvolutionFor, sourceEncounterStage, openSourceArenaForStage } from "@codigdex/game-content/domain/openSourceChapters";
import { careerQAPresets } from "@codigdex/game-content/domain/careerQAPresets";
import { normalizeGameSave } from "@codigdex/game-content/domain/gameProgress";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import { parseSave } from "@codigdex/game-core/save/schema";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { OPEN_SOURCE_MOBILE_ART } from "@codigdex/game-assets/openSourceArt";

const at = "2026-11-02T00:00:00.000Z";
function fixture(toolId: string) {
  const career = SOURCE_CAREERS.find(({ id }) => encounterTools(id).some((entry) => entry.id === toolId))!;
  const save = careerQAPresets("en", at).find(({ id }) => id === `encounter:${career.id}`)!.save;
  const trigger = save.ui.checkpointId!;
  save.progress.captures.push({ id: trigger, capturedAt: at });
  const pending: SourceEncounter = { id: `${career.id}:${trigger}:journey`, careerId: career.id, toolId, triggerId: trigger, triggerAt: at, victoryId: "journey", state: "offered", returnTo: { scene: "career-region", data: { careerId: career.id, regionId: "retained-region" } } };
  const key = sourceEventStorageKey(save)!;
  const memory = new Map([[key, JSON.stringify({ ...emptyEncounterHistory(), offeredCareers: [career.id], discoveries: [{ toolId, careerId: career.id }], pending })]]);
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } };
  return { save, pending, key, storage, memory, session: new SourceEventSession(storage) };
}
async function pass(id: string) {
  const form = openSourceEvolutionFor(id.replace(/^open-source:/, "").replace(/:lv[1-4]$/, "")).find((form) => form.id === id)!;
  let battle = createBattleState((await loadQuizPack(form.quizPackId)).questions);
  while (battle.status === "active") {
    const q = battle.questions[battle.questionIndex]; if (q.type === "freeText") throw new Error("Expected choices");
    battle = submitBattleAnswer(battle, battle.questionIndex, q.answerIndex);
  }
  return battle;
}
describe.each(OPEN_SOURCE_CATALOG)("$id continuous request", (entry) => {
  it("retains an old final card while completing the four missing forms in the same request", async () => {
    const { save: original, pending, storage, memory, key } = fixture(entry.id);
    let save = original;
    const forms = openSourceEvolutionFor(entry.id), final = forms.at(-1)!;
    save.progress.captures.push({ id: final.id, capturedAt: at });
    memory.set(key, JSON.stringify({ ...emptyEncounterHistory(), pending: { ...pending, state: "active" } }));
    const session = new SourceEventSession(storage);
    expect(session.canBattle(save, pending.id, final.id)).toBe(true);
    expect(session.resolvePending(save)?.stageId).toBe(forms[0].id);
    for (const form of forms.slice(0, 4)) {
      save = applyBattleCapture(save, form.id, await pass(form.id));
      const completed = session.completeStage(save, pending.id, form.id);
      expect(completed?.kind).toBe(form.level === 4 ? "complete" : "next");
    }
    expect(session.pending(save)).toBeUndefined();
    expect(save.progress.captures.filter(({ id }) => id === final.id)).toEqual([{ id: final.id, capturedAt: at }]);
  });
  it("captures all five forms in one request, pauses safely and returns after the final form", async () => {
    const fixtureState = fixture(entry.id), { pending, storage } = fixtureState;
    let { save, session } = fixtureState;
    const originalBookmark = save.ui.checkpointId;
    expect(session.accept(save, pending.id)).toBe(true);
    for (const form of openSourceEvolutionFor(entry.id)) {
      expect(session.pending(save)?.id).toBe(pending.id);
      expect(sourceEncounterStage(save, session.pending(save)!)?.id).toBe(form.id);
      expect(session.canBattle(save, pending.id, form.id)).toBe(true);
      save = normalizeGameSave(parseSave(JSON.stringify(applyBattleCapture(save, form.id, await pass(form.id))))!);
      expect(session.canBattle(save, pending.id, form.id)).toBe(true);
      const completed = session.completeStage(save, pending.id, form.id)!;
      expect(completed.kind).toBe(form.level === 5 ? "complete" : "next");
      if (form.level < 5) expect(session.completeStage(save, pending.id, form.id)).toEqual(completed);
      if (form.level === 2) {
        expect(session.leave(save, pending.id)).toEqual(pending.returnTo);
        expect(session.pending(save)?.state).toBe("paused");
        expect(session.canBattle(save, pending.id, completed.kind === "next" ? completed.stage.id : "")).toBe(false);
        expect(session.queue(save, save, pending.triggerId, pending.returnTo, () => 0, "ordinary-win")).toBeUndefined();
        session = new SourceEventSession(storage);
        expect(session.resolvePending(save)?.state).toBe("paused");
        expect(session.accept(save, pending.id)).toBe(true);
      }
      expect(save.ui.checkpointId).toBe(originalBookmark);
    }
    expect(session.pending(save)).toBeUndefined();
    expect(save.progress.captures.filter(({ id }) => openSourceEvolutionFor(entry.id).some((form) => form.id === id))).toHaveLength(5);
  });
});
it("repairs history-ahead and capture-ahead writes on reload without weakening live authorization", async () => {
  const { save, session, pending, storage, memory, key } = fixture("tanstack-query");
  const forms = openSourceEvolutionFor("tanstack-query");
  session.accept(save, pending.id);
  const after = applyBattleCapture(save, forms[0].id, await pass(forms[0].id));
  session.resolvePending(after, false);
  expect(session.canBattle(after, pending.id, forms[0].id)).toBe(true);
  const capturedHistory = memory.get(key)!;
  session.completeStage(after, pending.id, forms[0].id);
  const historyAhead = new SourceEventSession(storage);
  expect(historyAhead.resolvePending(save)?.stageId).toBe(forms[0].id);
  expect(historyAhead.accept(save, pending.id)).toBe(true);
  expect(historyAhead.canBattle(save, pending.id, forms[0].id)).toBe(true);
  memory.set(key, capturedHistory);
  const capturesAhead = new SourceEventSession(storage);
  expect(capturesAhead.resolvePending(after)?.stageId).toBe(forms[1].id);
  expect(capturesAhead.canBattle(after, pending.id, forms[1].id)).toBe(true);
});
it("stores pause and its next form in one history write, with strict stage and parser checks", async () => {
  const { save, pending, session, storage } = fixture("tanstack-query");
  const form = openSourceEvolutionFor("tanstack-query")[0];
  session.accept(save, pending.id);
  const after = applyBattleCapture(save, form.id, await pass(form.id));
  let writes = 0;
  const counted = new SourceEventSession({ getItem: storage.getItem, setItem: (key, value) => { writes++; storage.setItem(key, value); } });
  counted.leave(after, pending.id);
  expect(writes).toBe(1);
  expect(counted.pending(after)).toMatchObject({ state: "paused", stageId: "open-source:tanstack-query:lv2" });
  expect(parseEncounterHistory(JSON.stringify(counted.read(after))).pending).toEqual(counted.pending(after));
  expect(counted.canBattle(after, pending.id, "open-source:tanstack-query:lv2")).toBe(false);
  expect(counted.completeStage(after, pending.id, "open-source:tanstack-query:lv2")).toBeUndefined();
});
it("gives every OSS form the correct distinct ecosystem arena at the existing native pixel size", () => {
  const seen = new Set<string>();
  for (const key of OPEN_SOURCE_MOBILE_ART) {
    const png = readFileSync(path.resolve(import.meta.dirname, "../../../packages/game-assets/files", key));
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([320, 180]);
    seen.add(createHash("sha256").update(png).digest("hex"));
  }
  expect(seen.size).toBe(9);
  for (const entry of OPEN_SOURCE_CATALOG) for (const form of openSourceEvolutionFor(entry.id)) expect(openSourceArenaForStage(form.id)?.assetKey).toBe(`wallpapers/open-source/${entry.family}-arena-v1.png`);
});
