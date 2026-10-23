import { expect, test, type Page } from "@playwright/test";
import cases from "../../qa/home/cases.json" with { type: "json" };
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { careerPathFor } from "@codigdex/game-content/domain/careerPaths";
import { nextPlayableCheckpoint, selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { createBattleState, revealBattleHint, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import type { JobId } from "@codigdex/game-content/domain/player/jobs";
import { careerCheckpointLayout } from "../lib/phaser/worldMap/careerCheckpointLayout";

const KEY = "codigdex:save:v3";
const tutorial = cases.battles.tutorial as unknown as { monsterId: string; questions: QuizQuestion[] };

function fixture(chapters = 0) {
  const save = createEmptySave("en");
  save.ui.tutorialOnboardingSeen = true;
  save.progress.captures = CHAPTERS.slice(0, chapters).flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-01-01T00:00:00.000Z" })));
  save.ui.checkpointId = nextPlayableCheckpoint(save).monster.id;
  return save;
}

async function scene(page: Page, name: string) {
  await expect(page.getByRole("application")).toHaveAttribute("data-scene", name, { timeout: 30000 });
}

async function clickGame(page: Page, x: number, y: number) {
  const canvas = page.locator(".pixel-canvas canvas");
  const box = (await canvas.boundingBox())!;
  await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } });
  await frames(page);
}

async function frames(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function readSave(page: Page): Promise<StoredGameStateV3> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), KEY);
}

async function boot(page: Page, save = fixture()) {
  await page.addInitScript(({ key, save }) => {
    // Each test has a fresh browser context. Preserve subsequent saves on reload.
    if (!sessionStorage.getItem("home-qa-seeded")) {
      localStorage.setItem(key, JSON.stringify(save));
      sessionStorage.setItem("home-qa-seeded", "1");
    }
  }, { key: KEY, save });
  await page.goto("/");
  await scene(page, "intro");
  await expect(page.getByRole("application")).toHaveAttribute("aria-busy", "false");
  await page.keyboard.press("Enter");
  await scene(page, "world-map");
}

async function enterBattle(page: Page) {
  await page.keyboard.press("Space");
  await frames(page);
  await clickGame(page, 872, 516);
  await scene(page, "code-battle");
  await expect(page.locator(".battle-controls")).toBeVisible();
}

async function playTutorial(page: Page, pass: boolean, hints: boolean) {
  const controls = page.locator(".battle-controls");
  let battle = createBattleState(tutorial.questions);
  while (battle.status === "active") {
    const index = battle.questionIndex;
    const question = battle.questions[index];
    await expect(controls.locator(".battle-prompt")).toHaveText(question.prompt.en);
    if (question.type === "freeText") {
      const input = controls.getByRole("textbox", { name: "Short answer" });
      const submit = controls.getByRole("button", { name: "SUBMIT", exact: true });
      await expect(submit).toBeDisabled();
      await input.fill("   ");
      await expect(submit).toBeDisabled();
      if (hints) {
        for (let i = 0; i < Math.min(2, question.hints?.length ?? 0); i++) {
          await controls.getByRole("button", { name: /^HINT/ }).click();
          battle = revealBattleHint(battle, index);
          await expect(controls.locator(".battle-hint")).toHaveCount(i + 1);
        }
        await expect(controls.getByRole("button", { name: /^HINT/ })).toBeDisabled();
      }
      const answer = pass ? `  ${question.acceptedAnswers[0].toUpperCase()}  ` : "definitely-wrong-answer";
      await input.fill(answer);
      await input.press("Enter");
      battle = submitBattleAnswer(battle, index, answer);
    } else {
      const answer = pass ? question.answerIndex : (question.answerIndex + 1) % question.choices.length;
      await controls.locator(".battle-choices button").nth(answer).click();
      battle = submitBattleAnswer(battle, index, answer);
    }
    await expect(controls.getByRole("status")).toContainText(pass ? "Correct!" : "Incorrect");
    if (hints && question.type === "freeText") await expect(controls.getByRole("status")).toContainText("Attack strength: 50");
    // Feedback must remain until the user explicitly continues.
    await expect(controls.locator(".battle-progress")).toContainText(`${index + 1}/`);
    await controls.getByRole("button", { name: battle.status === "active" ? "NEXT QUESTION" : "SHOW RESULT", exact: true }).click();
  }
  await scene(page, "capture-quiz");
  await expect.poll(async () => (await readSave(page)).progress.captures.some(({ id }) => id === tutorial.monsterId)).toBe(pass);
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === "passed") await page.screenshot({ path: testInfo.outputPath("verified.png") });
});

test("@cod-235 mixed quiz accepts normalized text, blocks blanks and limits hints", async ({ page }) => {
  await boot(page);
  await enterBattle(page);
  await playTutorial(page, true, true);
});

test("@cod-235 failing answers do not register a capture", async ({ page }) => {
  await boot(page);
  await enterBattle(page);
  await playTutorial(page, false, false);
  expect((await readSave(page)).progress.captures).toHaveLength(0);
});

test("@cod-234 capture and replay keep one dex card", async ({ page }) => {
  await boot(page);
  await enterBattle(page);
  await playTutorial(page, true, false);
  await page.reload();
  await scene(page, "intro");
  await page.keyboard.press("Enter");
  await scene(page, "world-map");
  // Replay the cleared tutorial through its map, using a real stored bookmark.
  // Reload the bookmarked fixture in a separate context step, preserving earned captures.
  const save = await readSave(page);
  save.ui.checkpointId = tutorial.monsterId;
  await page.evaluate(({ key, save }) => localStorage.setItem(key, JSON.stringify(save)), { key: KEY, save });
  await page.reload();
  await scene(page, "intro");
  await page.keyboard.press("Enter");
  await scene(page, "world-map");
  await enterBattle(page);
  await playTutorial(page, true, false);
  expect((await readSave(page)).progress.captures.filter(({ id }) => id === tutorial.monsterId)).toHaveLength(1);
});

test("@cod-236 startup, locale restore and unconfigured account UI", async ({ page }) => {
  await boot(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "ACCOUNT · SAVE" }).click();
  const panel = page.getByRole("region", { name: "Account and save" });
  await expect(panel).toContainText("device");
  await expect(panel.getByRole("button", { name: /SIGN IN/ })).toHaveCount(0);
  await panel.getByRole("button", { name: "CLOSE", exact: true }).click();
  await page.reload();
  await scene(page, "intro");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect((await readSave(page)).ui.locale).toBe("en");
});

test("@cod-237 locked chapter cannot start; tutorial completion unlocks Git", async ({ page }) => {
  await boot(page);
  await clickGame(page, 480, 24);
  await scene(page, "path-map");
  await clickGame(page, 24, 280); // Close any focused stage panel.
  await clickGame(page, 300, 272); // Locked Linux chapter.
  await clickGame(page, 690, 408); // No enabled battle action is available.
  await scene(page, "path-map");
  expect((await readSave(page)).progress.captures).toHaveLength(0);
  await clickGame(page, 26, 26);
  await scene(page, "intro");
  await page.keyboard.press("Enter");
  await scene(page, "world-map");
  await enterBattle(page);
  await playTutorial(page, true, false);
  expect((await readSave(page)).ui.checkpointId).toBe(CHAPTERS[1].stages[0].id);
  await page.reload();
  await scene(page, "intro");
  await page.keyboard.press("Enter");
  await scene(page, "world-map");
  await enterBattle(page);
  await expect(page.locator(".battle-prompt")).toHaveText(cases.battles.git.questions[0].prompt.en);
});

test("@cod-238 Git to Linux continuation survives reload", async ({ page }) => {
  const save = fixture(2);
  await boot(page, save);
  expect((await readSave(page)).ui.checkpointId).toBe(CHAPTERS[2].stages[0].id);
  await page.reload();
  await scene(page, "intro");
  await page.keyboard.press("Enter");
  await scene(page, "world-map");
  await enterBattle(page);
  expect((await readSave(page)).ui.checkpointId).toBe(CHAPTERS[2].stages[0].id);
  expect((await readSave(page)).progress.captures).toHaveLength(save.progress.captures.length);
});

for (const career of cases.careers) {
  test(`@cod-238 ${career.jobId} career gates and bookmarked battle`, async ({ page }) => {
    const save = selectGameCareer(fixture(3), career.jobId as JobId);
    await boot(page, save);
    const path = careerPathFor(career.jobId as JobId);
    const locked = path.regions[1];
    await clickGame(page, locked.lift.x, locked.lift.y);
    await scene(page, "world-map");
    expect((await readSave(page)).ui.checkpointId).toBe(career.firstMonsterId);
    const first = path.regions[0];
    await clickGame(page, first.lift.x, first.lift.y);
    await scene(page, "career-region");
    const point = careerCheckpointLayout(career.jobId as JobId, first.id)[0];
    await clickGame(page, point.x, point.y);
    await scene(page, "code-battle");
    await expect(page.locator(".battle-prompt")).toBeVisible();
    expect((await readSave(page)).player.primaryJobId).toBe(career.jobId);
    expect((await readSave(page)).ui.checkpointId).toBe(career.firstMonsterId);
    await page.reload();
    await scene(page, "intro");
    await page.keyboard.press("Enter");
    await scene(page, "world-map");
    expect((await readSave(page)).player.primaryJobId).toBe(career.jobId);
    expect((await readSave(page)).ui.checkpointId).toBe(career.firstMonsterId);
  });
}
