import { test, expect } from "@playwright/test";
import { gameQAPresets } from "@codigdex/game-content/domain/qaPresets";
import { TERTIARY_JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { masterChapterFor } from "@codigdex/game-content/domain/masterChapters";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { bootGame, clickGame, answerBattle, confirmResult, readSave, reloadGame } from "../test-support/game";

for (const job of TERTIARY_JOB_OPTIONS) test(`${job.id}: completes five design milestones, confirms career and restores it`, async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const save = gameQAPresets("en").find(({ id }) => id === `master-project:${job.id}`)!.save;
  await bootGame(page, save);
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  for (const monster of masterChapterFor(job.id)!.stages) {
    await clickGame(page, 742, 509);
    const workshop = page.locator(".career-workshop");
    await expect(workshop).toBeVisible();
    await expect(workshop.locator("pre")).not.toBeEmpty();
    await workshop.getByRole("button", { name: "START DESIGN VERIFICATION", exact: true }).click();
    await answerBattle(page, monster.id);
    await confirmResult(page);
    await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
    expect((await readSave(page)).progress.captures.some(({ id }) => id === monster.id)).toBe(true);
  }
  expect((await readSave(page)).player.tertiaryJobId).toBeNull();
  await clickGame(page, 742, 509);
  expect((await readSave(page)).player.tertiaryJobId).toBe(job.id);
  await reloadGame(page);
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  expect((await readSave(page)).player.tertiaryJobId).toBe(job.id);
  await page.screenshot({ path: `../qa-results/master-${job.id}-en.png` });
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("codigdex:save:v3")!);
    save.ui.locale = "ko";
    localStorage.setItem("codigdex:save:v3", JSON.stringify(save));
  });
  await reloadGame(page);
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  await page.screenshot({ path: `../qa-results/master-${job.id}-ko.png` });
  expect(errors).toEqual([]);
});

test("regional practice: failure does not save, passing resumes across reload and unlocks the guardian", async ({ page }) => {
  test.setTimeout(120000);
  const save = gameQAPresets("en").find(({ id }) => id === "workshop:platform-engineer")!.save;
  const monster = promotionChapterFor("platform-engineer")!.stages[0];
  const pack = await loadQuizPack(monster.quizPackId);
  await bootGame(page, save);
  await expect(page.getByRole("application")).toHaveAttribute("data-scene", "promotion-chapter");
  await clickGame(page, 742, 509);
  const root = page.locator(".career-workshop");
  async function answerPractice(correct: boolean) {
    const prompt = await root.locator(".workshop-practice h3").innerText();
    const question = pack.questions.find(({ prompt: copy }) => copy.en === prompt)!;
    if (!question || question.type === "freeText") throw new Error(`Unexpected practice: ${prompt}`);
    await root.getByRole("button", { name: question.choices[correct ? question.answerIndex : (question.answerIndex + 1) % 4].en, exact: true }).click();
    await root.getByRole("button", { name: "CONTINUE", exact: true }).click();
  }
  for (let i = 0; i < 3; i++) await answerPractice(false);
  await expect(root.getByRole("button", { name: "RETRY PRACTICE", exact: true })).toBeVisible();
  expect((await readSave(page)).progress.projects ?? []).toEqual([]);
  await root.getByRole("button", { name: "RETRY PRACTICE", exact: true }).click();
  for (let phase = 0; phase < 4; phase++) {
    for (let i = 0; i < 3; i++) await answerPractice(true);
    expect((await readSave(page)).progress.projects).toHaveLength(phase + 1);
    if (phase === 0) {
      await reloadGame(page);
      await expect(page.getByRole("application")).toHaveAttribute("data-scene", "promotion-chapter");
      await clickGame(page, 742, 509);
    } else await root.getByRole("button", { name: "CONTINUE PRACTICE", exact: true }).click();
  }
  await page.screenshot({ path: "../qa-results/secondary-workshop-en.png" });
  await root.getByRole("button", { name: "START GUARDIAN BATTLE", exact: true }).click();
  await answerBattle(page, monster.id);
  await confirmResult(page);
  expect((await readSave(page)).progress.captures.some(({ id }) => id === monster.id)).toBe(true);
});
