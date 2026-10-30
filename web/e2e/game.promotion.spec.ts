import { test, expect } from "@playwright/test";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { PROMOTION_MISSIONS } from "@codigdex/game-content/domain/promotionChapters";
import { SECONDARY_JOB_OPTIONS, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { completedCareerPathIds } from "@codigdex/game-content/domain/careerPaths";
import { selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { bootGame, clickGame, answerBattle, confirmResult, readSave, reloadGame } from "../test-support/game";

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

async function openLineage(page: import("@playwright/test").Page) {
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", /^(world-map|promotion-chapter)$/);
  if (await game.getAttribute("data-scene") === "promotion-chapter") {
    await clickGame(page, 190, 509);
  } else {
    await clickGame(page, 480, 30);
    await expect(game).toHaveAttribute("data-scene", "path-map");
    await clickGame(page, 92, 513);
  }
  await expect(game).toHaveAttribute("data-scene", "job-select");
}

for (const job of SECONDARY_JOB_OPTIONS) {
  const rows = [106, 184, 262, 340, 418];
  const primaryIds = Object.keys(CAREER_PATHS);
  test(`does not reveal ${job.id} from stale mastery when a primary intermediate checkpoint is missing`, async ({ page }) => {
    const save = eligibleSave(job.id);
    const missingId = monstersForCareerRegion(CAREER_PATHS[job.requires[0]].regions[0].id)[1].id;
    save.progress.captures = save.progress.captures.filter(({ id }) => id !== missingId);
    save.progress.careers = [...job.requires, job.id].map((id) => ({ id, unlockedAt: "2026-10-27T00:00:00.000Z", masteredAt: "2026-10-27T00:00:00.000Z" }));
    await bootGame(page, save);
    await openLineage(page);
    await clickGame(page, 565, rows[SECONDARY_JOB_OPTIONS.indexOf(job)]);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "job-select");
    expect((await readSave(page)).player.secondaryJobId).toBeNull();
    await page.screenshot({ path: `../qa-results/career-progression/${job.id}-locked.png` });
  });

  test(`keeps ${job.id} during completed primary replay and gates unfinished studies until mastery`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const selected = selectSecondaryCareer(eligibleSave(job.id), job.id);
    const completed = completedCareerPathIds(new Set(selected.progress.captures.map(({ id }) => id)));
    const unfinished = primaryIds.find((id) => !completed.has(id as keyof typeof CAREER_PATHS))!;
    await bootGame(page, selected);
    await openLineage(page);
    await clickGame(page, 245, rows[primaryIds.indexOf(unfinished)]);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "job-select");
    expect((await readSave(page)).player.secondaryJobId).toBe(job.id);
    const replayId = job.requires[1];
    await clickGame(page, 245, rows[primaryIds.indexOf(replayId)]);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "world-map");
    expect((await readSave(page)).player.primaryJobId).toBe(replayId);
    expect((await readSave(page)).player.secondaryJobId).toBe(job.id);
    await reloadGame(page);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "world-map");
    expect((await readSave(page)).player.secondaryJobId).toBe(job.id);
    await openLineage(page);
    await clickGame(page, 565, rows[SECONDARY_JOB_OPTIONS.indexOf(job)]);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "promotion-chapter");
    expect((await readSave(page)).player.secondaryJobId).toBe(job.id);

    // Seed an earned mastery snapshot, then use the actual UI to start a new study.
    const mastered = await readSave(page);
    mastered.progress.captures.push(...PROMOTION_MISSIONS[job.id].chapter.stages.map(({ id }) => ({ id, capturedAt: "2026-10-30T00:00:00.000Z" })));
    await page.evaluate((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), mastered);
    await reloadGame(page);
    await openLineage(page);
    await clickGame(page, 245, rows[primaryIds.indexOf(unfinished)]);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "world-map");
    const studying = await readSave(page);
    expect(studying.player.primaryJobId).toBe(unfinished);
    expect(studying.player.secondaryJobId).toBe(job.id);
    await reloadGame(page);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "world-map");
    expect((await readSave(page)).player.secondaryJobId).toBe(job.id);
    await page.screenshot({ path: `../qa-results/career-progression/${job.id}-primary-study.png` });
    expect(errors).toEqual([]);
  });
}
