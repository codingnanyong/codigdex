import { expect, it } from "vitest";
import { createBattleState, revealBattleHint, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { same } from "@codigdex/game-core/i18n/locale";
import { battleReadout } from "@/lib/phaser/battle/readout";

const question = { prompt: same("Choose"), choices: [same("Yes"), same("No"), same("Maybe"), same("Later")], answerIndex: 0, hints: [same("Think")] };
it("distinguishes spare mistakes from the fatal mistake at Lv.5", () => {
  let battle = createBattleState(Array.from({ length: 7 }, () => question));
  expect(battleReadout(battle, "en")).toMatchObject({ required: 5, remainingCorrect: 5, mistakeAllowance: 2, health: 1 });
  battle = submitBattleAnswer(battle, 0, 1);
  expect(battleReadout(battle, "en").mistakeAllowance).toBe(1);
  battle = submitBattleAnswer(battle, 1, 1);
  expect(battle.status).toBe("active");
  expect(battleReadout(battle, "en").mistakeAllowance).toBe(0);
  battle = submitBattleAnswer(battle, 2, 1);
  expect(battleReadout(battle, "en").threshold).toContain("NOT PASSED");
});
it("does not announce capture while a required design judgment is still pending", () => {
  let battle = createBattleState([question, question, { ...question, required: true }]);
  battle = submitBattleAnswer(battle, 0, 0);
  battle = submitBattleAnswer(battle, 1, 0);
  expect(battle.status).toBe("active");
  expect(battleReadout(battle, "ko")).toMatchObject({ health: 0, remainingCorrect: 0 });
  expect(battleReadout(battle, "ko").threshold).toContain("필수 설계 판단");
  expect(battleReadout(battle, "ko").caption).toBe("필수 판단 남음");
  const failed = submitBattleAnswer(battle, 2, 1);
  expect(battleReadout(failed, "ko").threshold).toContain("통과하지 못했습니다");
  const passed = submitBattleAnswer(battle, 2, 0);
  expect(battleReadout(passed, "ko").threshold).toContain("포획 준비 완료");
});
it("hints change attack damage rather than the pass target or correct-answer count", () => {
  let battle = createBattleState([question, question, question]);
  battle = revealBattleHint(battle, 0);
  battle = submitBattleAnswer(battle, 0, 0);
  expect(battle.damage).toBe(75);
  expect(battleReadout(battle, "en")).toMatchObject({ required: 2, remainingCorrect: 1, mistakeAllowance: 1 });
});
