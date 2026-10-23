import { describe, expect, it } from "vitest";
import { CHAPTERS, DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { canEnterBattle, captureCheckpoint, nextPlayableCheckpoint, normalizeGameSave, resumeCheckpoint, selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { same } from "@codigdex/game-core/i18n/locale";
import { battleQuestions } from "../../../mobile/src/game/battle";
import { drawMixedQuizQuestions, quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { loadMixedQuizPack } from "@codigdex/quiz-content";

const win = submitBattleAnswer(createBattleState([{ prompt: same("ok"), choices: [same("yes")], answerIndex: 0 }]), 0, 0);
const common = CHAPTERS.flatMap(({ stages }) => stages);
function completedCommon() {
  const save = createEmptySave("en");
  save.progress.captures = common.map(({ id }) => ({ id, capturedAt: "2026-10-23T00:00:00.000Z" }));
  return save;
}

describe("one released game contract for Web and Mobile", () => {
  it("draws identical question types, order and choices with the same RNG", async () => {
    for (const monster of [CHAPTERS[0].stages[0], CHAPTERS[1].stages[0], DEX_MONSTERS.at(-1)!]) {
      const pack = await loadMixedQuizPack(monster.quizPackId);
      expect(battleQuestions(monster, pack.questions, () => .3)).toEqual(drawMixedQuizQuestions(pack.questions, quizCountForLevel(monster.level), () => .3));
    }
  });
  it("supports all five released career paths, with shared gates, checkpoints and save continuation", () => {
    for (const job of JOB_OPTIONS) {
      let save = completedCommon();
      expect(canEnterBattle(save, monstersForCareerRegion(careerPathFor(job.id).regions[0].id)[0].id)).toBe(false);
      save = selectGameCareer(save, job.id);
      const expected = careerPathFor(job.id).regions.flatMap(({ id }) => monstersForCareerRegion(id));
      for (const monster of expected) {
        expect(nextPlayableCheckpoint(save).monster.id).toBe(monster.id);
        expect(canEnterBattle(save, monster.id)).toBe(true);
        const later = expected.slice(expected.indexOf(monster) + 1);
        expect(later.every((entry) => !canEnterBattle(save, entry.id))).toBe(true);
        save = parseSave(JSON.stringify(captureCheckpoint(save, monster.id, win)))!;
        expect(resumeCheckpoint(save).monster.id).toBe(nextPlayableCheckpoint(save).monster.id);
      }
      expect(save.progress.careers.find(({ id }) => id === job.id)?.masteredAt).toBeTruthy();
      expect(selectGameCareer(save, JOB_OPTIONS.find(({ id }) => id !== job.id)!.id).player.primaryJobId).not.toBe(job.id);
    }
  });
  it("keeps a chosen career binding until complete and ignores fabricated mastery flags", () => {
    let save = selectGameCareer(completedCommon(), "frontend");
    expect(selectGameCareer(save, "backend")).toBe(save);
    save.progress.careers.push({ id: "backend", unlockedAt: "2026-10-01", masteredAt: "2026-10-01" });
    save = normalizeGameSave(save);
    expect(save.progress.careers.find(({ id }) => id === "backend")?.masteredAt).toBeUndefined();
    expect(selectGameCareer(save, "backend")).toBe(save);
  });
});
