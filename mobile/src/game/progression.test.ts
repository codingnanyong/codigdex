import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { describe, expect, it } from "vitest";
import { canEnterCheckpoint, checkpoints, nextCheckpoint, selectedCheckpoint } from "./progression";
import { captureCheckpoint, rememberCheckpoint, resumeCheckpoint } from "./progression";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { same } from "@codigdex/game-core/i18n/locale";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";

describe("mobile common-path navigation", () => {
  it("unlocks each checkpoint in tutorial → Git → Linux order", () => {
    const captured = new Set<string>();
    const monsters = CHAPTERS.flatMap(({ stages }) => stages);
    for (const [index, monster] of monsters.entries()) {
      expect(nextCheckpoint(captured).monster.id).toBe(monster.id);
      expect(checkpoints(captured).filter(({ status }) => status === "available")).toHaveLength(1);
      for (const [otherIndex, other] of monsters.entries()) {
        expect(canEnterCheckpoint(captured, other.id)).toBe(otherIndex <= index);
      }
      captured.add(monster.id);
    }
    expect(checkpoints(captured).every(({ status }) => status === "cleared")).toBe(true);
    expect(nextCheckpoint(captured).monster.id).toBe(monsters.at(-1)!.id);
  });

  it("preserves captured replays without allowing out-of-order records to unlock later stages", () => {
    const git = CHAPTERS[1].stages;
    const captured = new Set([git[1].id, "unknown-id"]);
    expect(canEnterCheckpoint(captured, git[1].id)).toBe(true);
    expect(canEnterCheckpoint(captured, git[2].id)).toBe(false);
    expect(canEnterCheckpoint(captured, "unknown-id")).toBe(false);
    expect(nextCheckpoint(captured).chapter.id).toBe("tutorial");
    expect(selectedCheckpoint(captured, "removed-monster")).toEqual(nextCheckpoint(captured));
  });

  it("keeps region inspection separate from battle access and falls back safely after a reset", () => {
    const captured = new Set<string>();
    const selected = selectedCheckpoint(captured, CHAPTERS[2].stages[0].id);
    expect(selected.chapter.id).toBe("linux");
    expect(selected.status).toBe("locked");
    expect(canEnterCheckpoint(captured, selected.monster.id)).toBe(false);
  });
});

describe("persistent checkpoint selection", () => {
  it("retains a playable replay bookmark through serialization, language changes and reload", () => {
    const save = createEmptySave("ko");
    save.progress.captures = CHAPTERS.slice(0, 2).flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-10-21" })));
    const bookmarked = rememberCheckpoint(save, CHAPTERS[1].stages[2].id);
    const reloaded = parseSave(JSON.stringify({ ...bookmarked, ui: { ...bookmarked.ui, locale: "en" } }))!;
    expect(resumeCheckpoint(reloaded).monster.id).toBe(CHAPTERS[1].stages[2].id);
    expect(reloaded.ui.locale).toBe("en");
    expect(reloaded.progress.captures).toEqual(save.progress.captures);
    expect(rememberCheckpoint(bookmarked, CHAPTERS[1].stages[2].id)).toBe(bookmarked);
  });

  it("does not persist locked/unknown selections and repairs stale bookmarks using saved progress", () => {
    const save = createEmptySave();
    for (const id of ["unknown", CHAPTERS[2].stages[4].id]) {
      expect(rememberCheckpoint(save, id)).toBe(save);
      expect(resumeCheckpoint({ ...save, ui: { ...save.ui, checkpointId: id } }).chapter.id).toBe("tutorial");
    }
    expect(resumeCheckpoint(createEmptySave()).chapter.id).toBe("tutorial");
    expect(parseSave(JSON.stringify({ ...save, ui: { checkpointId: 42 } }))!.ui.checkpointId).toBeUndefined();
  });

  it("advances captures and resume together while failure, cancellation and replay keep the bookmark", () => {
    const id = CHAPTERS[0].stages[0].id;
    const save = rememberCheckpoint(createEmptySave(), id);
    const initial = createBattleState([{ prompt: same("Correct?"), choices: [same("yes"), same("no")], answerIndex: 0 }]);
    expect(captureCheckpoint(save, id, initial)).toBe(save);
    expect(captureCheckpoint(save, id, submitBattleAnswer(initial, 0, 1))).toBe(save);
    const passed = submitBattleAnswer(initial, 0, 0);
    const captured = captureCheckpoint(save, id, passed);
    expect(captured.progress.captures.map((capture) => capture.id)).toEqual([id]);
    expect(resumeCheckpoint(captured).monster.id).toBe(CHAPTERS[1].stages[0].id);
    const replaying = rememberCheckpoint(captured, id);
    expect(captureCheckpoint(replaying, id, passed)).toBe(replaying);
    expect(resumeCheckpoint(replaying).monster.id).toBe(id);
  });
});
