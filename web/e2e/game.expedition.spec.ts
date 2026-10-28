import { test, expect, type Page } from "@playwright/test";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { OPEN_SOURCE_EXPEDITIONS } from "@codigdex/game-content/domain/openSourceChapters";
import { SOURCE_CAREERS } from "@codigdex/game-content/domain/openSourceEncounters";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { scene, clickGame as click, readSave, bootGame as boot, reloadGame as reload, answerBattle, confirmResult } from "../test-support/game";
import { webQAPresets } from "../lib/qa/presets";
import { careerCheckpointLayout } from "../lib/phaser/worldMap/careerCheckpointLayout";
import type { JobId } from "@codigdex/game-content/domain/player/jobs";

async function firstCareerBattle(page: Page, save: StoredGameStateV3) {
  if (save.player.secondaryJobId) { await scene(page, "promotion-chapter"); await click(page, 742, 509); }
  else {
    await scene(page, "world-map");
    const job = save.player.primaryJobId as JobId;
    const region = CAREER_PATHS[job].regions[0];
    await click(page, region.lift.x, region.lift.y);
    await scene(page, "career-region");
    const point = careerCheckpointLayout(job, region.id)[0];
    await click(page, point.x, point.y);
  }
  await scene(page, "code-battle");
}
for (const career of SOURCE_CAREERS) test(`meets ${career.firstTool} inside the ${career.id} adventure and returns with progress intact`, async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const seed = webQAPresets("en").find(({ id }) => id === `encounter:${career.id}`)!.save;
  const normalMonster = seed.ui.checkpointId!;
  await boot(page, seed);
  await firstCareerBattle(page, seed);
  await answerBattle(page, normalMonster);
  const normalCheckpoint = (await readSave(page)).ui.checkpointId;
  await confirmResult(page);
  await scene(page, "open-source-event");
  await page.screenshot({ path: `../mobile/.tmp-qa/encounter-${career.id}.png` });
  await page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true }).click();
  const notes = page.getByRole("dialog");
  await expect(notes.locator("article")).toHaveCount(1);
  await expect(notes.locator(`[data-project="${career.firstTool}"]`)).toBeVisible();
  await expect(notes.getByRole("button", { name: /START MISSION|REPLAY MISSION/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  if (career.id === "frontend") { await reload(page); await scene(page, "open-source-event"); }
  await click(page, 718, 501);
  await scene(page, "code-battle");
  await answerBattle(page, `open-source:${career.firstTool}`);
  const captured = await readSave(page);
  expect(captured.ui.checkpointId).toBe(normalCheckpoint);
  expect(captured.player).toEqual(seed.player);
  expect(captured.progress.captures.filter(({ id }) => id === `open-source:${career.firstTool}`)).toHaveLength(1);
  expect(captured.progress.captures).toEqual(expect.arrayContaining(seed.progress.captures));
  if (career.id === "data-engineer") { await reload(page); await scene(page, "open-source-event"); await click(page, 718, 501); }
  else await confirmResult(page);
  await scene(page, seed.player.secondaryJobId ? "promotion-chapter" : "career-region");
  await reload(page);
  await scene(page, seed.player.secondaryJobId ? "promotion-chapter" : "world-map");
  expect((await readSave(page)).ui.checkpointId).toBe(normalCheckpoint);
  expect(errors).toEqual([]);
});

test("can postpone a request and keep its note without rerolling a replay", async ({ page }) => {
  const seed = webQAPresets("en").find(({ id }) => id === "encounter:frontend")!.save;
  await boot(page, seed);
  await firstCareerBattle(page, seed);
  await answerBattle(page, seed.ui.checkpointId!);
  await confirmResult(page);
  await scene(page, "open-source-event");
  await click(page, 242, 501);
  await scene(page, "career-region");
  expect((await readSave(page)).progress.captures.some(({ id }) => id.startsWith("open-source:"))).toBe(false);
  await reload(page);
  await scene(page, "world-map");
  await page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true }).click();
  await expect(page.getByRole("dialog").locator('[data-project="tanstack-query"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await firstCareerBattle(page, seed);
  await answerBattle(page, seed.ui.checkpointId!);
  await confirmResult(page);
  await scene(page, "career-region");
});

test("retries an event after failure and restores a pending request on reload", async ({ page }) => {
  test.setTimeout(90000);
  const seed = webQAPresets("ko").find(({ id }) => id === "encounter:frontend")!.save;
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page, seed);
  await firstCareerBattle(page, seed);
  await answerBattle(page, seed.ui.checkpointId!);
  const checkpoint = (await readSave(page)).ui.checkpointId;
  await confirmResult(page);
  await scene(page, "open-source-event");
  await page.screenshot({ path: "../mobile/.tmp-qa/encounter-narrow-ko.png" });
  await click(page, 718, 501);
  await answerBattle(page, "open-source:tanstack-query", false);
  expect((await readSave(page)).progress.captures.some(({ id }) => id === "open-source:tanstack-query")).toBe(false);
  await reload(page);
  await scene(page, "open-source-event");
  await click(page, 718, 501);
  await answerBattle(page, "open-source:tanstack-query");
  await confirmResult(page);
  await scene(page, "career-region");
  expect((await readSave(page)).ui.checkpointId).toBe(checkpoint);
});

for (const job of ["junior", "backend"] as const) test(`migrates old expedition bookmarks back into ${job} progression and keeps old cards`, async ({ page }) => {
  const save = createEmptySave("en");
  save.progress.captures = [...CHAPTERS.flatMap(({ stages }) => stages), OPEN_SOURCE_EXPEDITIONS[0].chapter.stages[0]].map(({ id }) => ({ id, capturedAt: "2026-10-28T00:00:00.000Z" }));
  save.player.primaryJobId = job;
  save.ui.tutorialOnboardingSeen = true;
  save.ui.checkpointId = OPEN_SOURCE_EXPEDITIONS[1].chapter.stages[0].id;
  await boot(page, save);
  await scene(page, job === "junior" ? "job-select" : "world-map");
  expect((await readSave(page)).progress.captures).toEqual(expect.arrayContaining(save.progress.captures));
  expect((await readSave(page)).ui.checkpointId).toBeUndefined();
  await page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true }).click();
  await expect(page.getByRole("dialog").locator('[data-project="hadoop"]')).toBeVisible();
});
