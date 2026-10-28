import { test, expect } from "@playwright/test";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { PROMOTION_MISSIONS } from "@codigdex/game-content/domain/promotionChapters";
import { SECONDARY_JOB_OPTIONS, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { bootGame, clickGame, answerBattle, confirmResult, readSave } from "../test-support/game";

function eligibleSave(jobId: SecondaryJobId = "platform-engineer") {
  const save = createEmptySave("en");
  const job = SECONDARY_JOB_OPTIONS.find(({ id }) => id === jobId)!;
  const stages = [...CHAPTERS.flatMap(({ stages }) => stages), ...job.requires.map((id) => CAREER_PATHS[id]).flatMap(({ regions }) => regions.flatMap(({ id }) => monstersForCareerRegion(id)))];
  save.progress.captures = [...new Set(stages.map(({ id }) => id))].map((id) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" }));
  save.player.primaryJobId = job.requires[0];
  save.ui.tutorialOnboardingSeen = true;
  return save;
}

for (const job of SECONDARY_JOB_OPTIONS) test(`restores ${job.id}, plays all five stages, and keeps mastery after reload`, async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const save = selectSecondaryCareer(eligibleSave(job.id), job.id);
  await bootGame(page, save);
  const game = page.getByRole("application");
  const click = (x: number, y: number) => clickGame(page, x, y);
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  await page.screenshot({ path: `../mobile/.tmp-qa/${job.id}-mission-en.png` });
  for (const monster of PROMOTION_MISSIONS[job.id].chapter.stages) {
    await click(742, 509);
    await answerBattle(page, monster.id);
    await confirmResult(page);
    await expect(game).toHaveAttribute("data-scene", /^(promotion-chapter|open-source-event)$/);
    if (await game.getAttribute("data-scene") === "open-source-event") await click(242, 501);
    await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
    const stored = await readSave(page);
    expect(stored.progress.captures.some(({ id }: { id: string }) => id === monster.id)).toBe(true);
  }
  await page.screenshot({ path: `../mobile/.tmp-qa/${job.id}-mastery-en.png` });
  await page.reload();
  await expect(game).toHaveAttribute("data-scene", "intro");
  await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  const stored = await readSave(page);
  expect(stored.progress.careers.find(({ id }) => id === job.id)?.masteredAt).toBeTruthy();
  expect(stored.player.tertiaryJobId).toBeNull();
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("codigdex:save:v3")!);
    save.ui.locale = "ko";
    localStorage.setItem("codigdex:save:v3", JSON.stringify(save));
  });
  await page.reload();
  await expect(game).toHaveAttribute("data-scene", "intro");
  await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  await page.screenshot({ path: `../mobile/.tmp-qa/${job.id}-mastery-ko.png` });
  expect(errors).toEqual([]);
});

test("keeps a promotion unchanged on cancel and equips it only after confirmation", async ({ page }) => {
  await bootGame(page, eligibleSave());
  const game = page.getByRole("application");
  const click = (x: number, y: number) => clickGame(page, x, y);
  await expect(game).toHaveAttribute("data-scene", "world-map");
  await click(480, 30);
  await expect(game).toHaveAttribute("data-scene", "path-map");
  await click(92, 513);
  await expect(game).toHaveAttribute("data-scene", "job-select");
  await click(565, 184);
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  await page.screenshot({ path: "../mobile/.tmp-qa/platform-promotion-confirm-en.png" });
  const selected = () => page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")!).player.secondaryJobId);
  expect(await selected()).toBeNull();
  await click(190, 509);
  await expect(game).toHaveAttribute("data-scene", "job-select");
  expect(await selected()).toBeNull();
  await click(565, 184);
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  await click(742, 509);
  await expect.poll(selected).toBe("platform-engineer");
});
