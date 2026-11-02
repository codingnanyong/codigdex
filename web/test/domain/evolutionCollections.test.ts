import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { ASSET_KEYS } from "@codigdex/game-assets/manifest";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { secondaryRegionsFor } from "@codigdex/game-content/domain/secondaryExploration";
import { gameQAPresets } from "@codigdex/game-content/domain/qaPresets";
import { careerQAPresets } from "@codigdex/game-content/domain/careerQAPresets";
import { normalizeGameSave, captureCheckpoint, canEnterBattle, isSecondaryStudyComplete, nextWorkshopPhase } from "@codigdex/game-content/domain/gameProgress";
import { openSourceEvolutionFor, openSourceEvolutionCount, sourceEncounterStage } from "@codigdex/game-content/domain/openSourceChapters";
import { discoveredSourceIds, encounterTools } from "@codigdex/game-content/domain/openSourceEncounters";
import { SourceEventSession } from "@codigdex/game-content/domain/openSourceEncounterSession";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { parseSave } from "@codigdex/game-core/save/schema";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
const root = path.resolve(import.meta.dirname, "../../..");
const at = "2026-11-02T00:00:00.000Z";
async function passed(id: string) {
  const monster = DEX_MONSTERS.find((monster) => monster.id === id)!;
  let battle = createBattleState((await loadQuizPack(monster.quizPackId)).questions);
  while (battle.status === "active") {
    const q = battle.questions[battle.questionIndex];
    if (q.type === "freeText") throw new Error("Expected choices");
    battle = submitBattleAnswer(battle, battle.questionIndex, q.answerIndex);
  }
  return battle;
}
describe("evolution collections and legacy cards", () => {
  it("numbers all 451 canonical entries once and includes exactly those IDs in the archive", () => {
    const audit = JSON.parse(readFileSync(path.join(root, "qa/art/dex-asset-audit.json"), "utf8"));
    expect(DEX_MONSTERS.map(({ dexNumber }) => Number(dexNumber))).toEqual(Array.from({ length: 451 }, (_, n) => n));
    expect(new Set(DEX_MONSTERS.map(({ id }) => id)).size).toBe(451);
    expect(new Set(DEX_MONSTERS.map(({ assetKey }) => assetKey)).size).toBe(451);
    expect([...audit.archiveIds].sort()).toEqual(DEX_MONSTERS.map(({ id }) => id).sort());
    expect(audit.exactPixelDuplicates).toEqual([]);
    expect(audit.sameSilhouetteCandidates).toEqual([]);
    for (const monster of DEX_MONSTERS) expect(ASSET_KEYS).toContain(monster.assetKey);
  });
  it("keeps relocated final OSS art byte-identical and families consecutive", () => {
    const moved = JSON.parse(readFileSync(path.join(root, "qa/art/open-source-art-relocation.json"), "utf8")) as { id: string; assetKey: string; sha256: string }[];
    expect(moved).toHaveLength(38);
    for (const entry of moved) {
      const bytes = readFileSync(path.join(root, "packages/game-assets/files", entry.assetKey));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);
      const forms = openSourceEvolutionFor(entry.id);
      expect(forms.map(({ level }) => level)).toEqual([1, 2, 3, 4, 5]);
      expect(forms.map(({ dexNumber }) => Number(dexNumber))).toEqual(Array.from({ length: 5 }, (_, i) => Number(forms[0].dexNumber) + i));
      expect(forms.at(-1)!.id).toBe(`open-source:${entry.id}`);
    }
  });
  it("preserves legacy secondary mastery while requiring new exploration for an unearned final project", () => {
    const save = gameQAPresets("en", at).find(({ id }) => id === "promotion:platform-engineer")!.save;
    const regions = secondaryRegionsFor("platform-engineer");
    save.progress.captures = save.progress.captures.filter(({ id }) => !id.startsWith("evolution:"));
    save.progress.captures.push(...regions.map(({ core }) => ({ id: core.id, capturedAt: at })));
    const restored = normalizeGameSave(parseSave(JSON.stringify(save))!);
    expect(restored.progress.careers.find(({ id }) => id === "platform-engineer")?.masteredAt).toBeTruthy();
    expect(isSecondaryStudyComplete(restored, "platform-engineer")).toBe(false);
    expect(canEnterBattle(restored, regions[0].chapter.stages[0].id)).toBe(true);
    expect(canEnterBattle(restored, regions[0].core.id)).toBe(true);
  });
  it("recovers practice from an interrupted evolution capture without duplicating records", async () => {
    const save = gameQAPresets("en", at).find(({ id }) => id === "workshop:platform-engineer")!.save;
    const region = secondaryRegionsFor("platform-engineer")[0], form = region.chapter.stages[0];
    const captured = captureCheckpoint(save, form.id, await passed(form.id));
    expect(nextWorkshopPhase(captured, region.core.id)).toBe(1);
    const interrupted = { ...captured, progress: { ...captured.progress, projects: [] } };
    const repaired = normalizeGameSave(interrupted);
    expect(nextWorkshopPhase(repaired, region.core.id)).toBe(1);
    expect(normalizeGameSave(repaired).progress.projects).toEqual(repaired.progress.projects);
    expect(canEnterBattle(repaired, region.chapter.stages[1].id)).toBe(true);
    expect(canEnterBattle(repaired, region.chapter.stages[2].id)).toBe(false);
  });
  it("pins every encounter's evolution through reload, success validation and return", async () => {
    let save = careerQAPresets("en", at).find(({ id }) => id === "encounter:frontend")!.save;
    const trigger = save.ui.checkpointId!;
    save.progress.captures.push({ id: trigger, capturedAt: at });
    save.progress.captures.push(...encounterTools("frontend").filter(({ id }) => id !== "tanstack-query").flatMap(({ id }) => openSourceEvolutionFor(id).map(({ id }) => ({ id, capturedAt: at }))));
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } };
    const target = { scene: "career-region" as const, data: { careerId: "frontend", regionId: "html-css" } };
    for (const form of openSourceEvolutionFor("tanstack-query")) {
      const session = new SourceEventSession(storage);
      let pending;
      for (let roll = 0; roll < 6 && !pending; roll++) pending = session.queue(save, save, trigger, target, () => 0, `${form.level}:${roll}`);
      expect(pending?.toolId).toBe("tanstack-query");
      expect(sourceEncounterStage(save, pending!)?.id).toBe(form.id);
      expect(session.accept(save, pending!.id)).toBe(true);
      const reloaded = new SourceEventSession(storage);
      expect(reloaded.canBattle(save, pending!.id, form.id)).toBe(true);
      expect(reloaded.canBattle(save, pending!.id, "open-source:hadoop:lv1")).toBe(false);
      if (form.level < 5) expect(reloaded.canBattle(save, pending!.id, "open-source:tanstack-query")).toBe(false);
      const after = captureCheckpoint(save, form.id, await passed(form.id));
      expect(reloaded.canBattle(after, pending!.id, form.id)).toBe(true);
      expect(reloaded.finish(after, pending!.id)).toEqual(target);
      save = normalizeGameSave(parseSave(JSON.stringify(after))!);
    }
    expect(openSourceEvolutionCount(save, "tanstack-query")).toBe(5);
    expect(discoveredSourceIds(save).has("tanstack-query")).toBe(true);
    expect(discoveredSourceIds(save).has("tanstack-query:lv1")).toBe(false);
  });
  it("prepares all new sprites on the existing 64px grid with binary alpha and at most 16 colors", async () => {
    const sprites = DEX_MONSTERS.filter(({ id, assetKey }) => id.startsWith("evolution:") || (assetKey.startsWith("monsters/mastery/") && assetKey.endsWith("-v3.png")) || /:lv[1-4]$/.test(id));
    expect(sprites).toHaveLength(277);
    for (const sprite of sprites) {
      const { data, info } = await sharp(path.join(root, "packages/game-assets/files", sprite.assetKey)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height], sprite.id).toEqual([256, 256]);
      const colors = new Set<string>(); let safe = true, aligned = true, binary = true;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const offset = (y * 256 + x) * 4, sample = ((y - y % 4) * 256 + x - x % 4) * 4;
        if (!data.subarray(offset, offset + 4).equals(data.subarray(sample, sample + 4))) aligned = false;
        if (data[offset + 3] !== 0 && data[offset + 3] !== 255) binary = false;
        if (data[offset + 3]) { colors.add(data.subarray(offset, offset + 4).toString("hex")); if (x < 16 || y < 16 || x >= 240 || y >= 240) safe = false; }
      }
      expect({ safe, aligned, binary, colors: colors.size <= 16 }, sprite.id).toEqual({ safe: true, aligned: true, binary: true, colors: true });
    }
  }, 20000);
});
