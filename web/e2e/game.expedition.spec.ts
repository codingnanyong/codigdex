import { test, expect, type Page } from "@playwright/test";
import { CHAPTERS, findStage } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { OPEN_SOURCE_EXPEDITIONS } from "@codigdex/game-content/domain/openSourceChapters";
import { SOURCE_CAREERS } from "@codigdex/game-content/domain/openSourceEncounters";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { webQAPresets } from "../lib/qa/presets";
import { careerCheckpointLayout } from "../lib/phaser/worldMap/careerCheckpointLayout";
import type { JobId } from "@codigdex/game-content/domain/player/jobs";

const game = (page: Page) => page.getByRole("application");
const readSave = (page: Page): Promise<StoredGameStateV3> => page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")!));
async function scene(page: Page, value: string) { await expect(game(page)).toHaveAttribute("data-scene", value, { timeout: 20000 }); }
async function click(page: Page, x: number, y: number) {
  const canvas = page.locator(".pixel-canvas canvas");
  const box = (await canvas.boundingBox())!;
  await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}
async function boot(page: Page, save: StoredGameStateV3) {
  await page.addInitScript((save) => {
    if (sessionStorage.getItem("encounter-seeded")) return;
    localStorage.setItem("codigdex:save:v3", JSON.stringify(save));
    sessionStorage.setItem("encounter-seeded", "1");
  }, save);
  await page.goto("/");
  await scene(page, "intro");
  await page.keyboard.press("Enter");
}
async function reload(page: Page) { await page.reload(); await scene(page, "intro"); await page.keyboard.press("Enter"); }
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
async function answerBattle(page: Page, monsterId: string, pass = true) {
  const pack = await loadMixedQuizPack(findStage(monsterId).monster.quizPackId);
  const controls = page.locator(".battle-controls");
  await expect(controls).toBeVisible();
  for (let i = 0; i < 10 && await game(page).getAttribute("data-scene") === "code-battle"; i++) {
    const prompt = await controls.locator(".battle-prompt").innerText();
    const question = pack.questions.find(({ prompt: copy }) => copy.en === prompt || copy.ko === prompt);
    if (!question) throw new Error(`Unexpected prompt: ${prompt}`);
    if (question.type === "freeText") {
      await controls.getByRole("textbox").fill(pass ? question.acceptedAnswers[0] : "definitely-wrong-answer");
      await controls.getByRole("button", { name: /^(SUBMIT|제출)$/ }).click();
    } else {
      const answer = question.choices[pass ? question.answerIndex : (question.answerIndex + 1) % question.choices.length];
      const text = question.prompt.en === prompt ? answer.en : answer.ko;
      await controls.getByRole("button", { name: new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") }).click();
    }
    await controls.getByRole("button", { name: /^(NEXT QUESTION|SHOW RESULT|다음 문제|결과 확인)$/ }).click();
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  }
  await scene(page, "capture-quiz");
}
async function confirmResult(page: Page) {
  for (let y = 505; y >= 280; y -= 10) {
    if (await game(page).getAttribute("data-scene") !== "capture-quiz") break;
    await click(page, 480, y);
  }
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
