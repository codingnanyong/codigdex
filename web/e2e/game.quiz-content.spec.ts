import { expect, test } from "@playwright/test";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { webQAPresets } from "../lib/qa/presets";
import { careerCheckpointLayout } from "../lib/phaser/worldMap/careerCheckpointLayout";
import { bootGame, clickGame, scene } from "../test-support/game";

for (const locale of ["ko", "en"] as const) for (const level of [1, 4, 5]) {
  test(`shows network level ${level} reasoning after grading (${locale})`, async ({ page }) => {
    await page.setViewportSize(level === 4 ? { width: 844, height: 390 } : { width: 1440, height: 900 });
    const seed = webQAPresets(locale).find(({ id }) => id === "encounter:devops")!.save;
    const monsters = monstersForCareerRegion("network");
    const monster = monsters[level - 1];
    seed.progress.captures.push(...monsters.slice(0, level - 1).map(({ id }) => ({ id, capturedAt: "2026-11-04T00:00:00.000Z" })));
    seed.ui.checkpointId = monster.id;
    await bootGame(page, seed);
    await scene(page, "world-map");
    const region = CAREER_PATHS.devops.regions.find(({ id }) => id === "network")!;
    await clickGame(page, region.lift.x, region.lift.y);
    await scene(page, "career-region");
    const point = careerCheckpointLayout("devops", "network")[level - 1];
    await clickGame(page, point.x, point.y);
    await scene(page, "code-battle");
    const controls = page.locator(".battle-controls");
    const prompt = await controls.locator(".battle-prompt").innerText();
    const pack = await loadMixedQuizPack(monster.quizPackId);
    const question = pack.questions.find(({ prompt: copy }) => copy[locale] === prompt)!;
    if (!question || question.type === "freeText") throw new Error("Expected an authored network choice question");
    const answer = question.choices[question.answerIndex][locale];
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await controls.getByRole("button", { name: new RegExp(escaped + "$") }).click();
    await expect(controls.locator(".battle-feedback")).toContainText(question.explanation![locale]);
    await expect(controls.getByRole("button", { name: /^(다음 문제|NEXT QUESTION)$/ })).toBeVisible();
    await expect(controls.locator(".battle-prompt")).toHaveText(prompt);
    await page.screenshot({ path: `../qa-results/network-reasoning-lv${level}-${locale}.png` });
  });
}
