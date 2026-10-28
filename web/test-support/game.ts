import { expect, type Page } from "@playwright/test";
import { findStage } from "@codigdex/game-content/domain/chapters";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { loadMixedQuizPack } from "@codigdex/quiz-content";

export const SAVE_KEY = "codigdex:save:v3";
const SEED_KEY = "codigdex-test-seeded";
const CANVAS_SIZE = { width: 960, height: 540 };

export const game = (page: Page) => page.getByRole("application");

export async function scene(page: Page, name: string) {
  await expect(game(page)).toHaveAttribute("data-scene", name, { timeout: 30000 });
}

export async function frames(page: Page) {
  // Phaser consumes pointer events on its next frame after the browser click returns.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

export async function clickGame(page: Page, x: number, y: number) {
  const canvas = page.locator(".pixel-canvas canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Game canvas is not visible");
  await canvas.click({ position: { x: x * box.width / CANVAS_SIZE.width, y: y * box.height / CANVAS_SIZE.height } });
  await frames(page);
}

export function readSave(page: Page): Promise<StoredGameStateV3> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), SAVE_KEY);
}

/** Seed once per isolated test context, preserving game writes and language changes on reload. */
export async function seedSave(page: Page, save: StoredGameStateV3) {
  await page.addInitScript(({ key, seedKey, save }) => {
    if (sessionStorage.getItem(seedKey)) return;
    localStorage.setItem(key, JSON.stringify(save));
    sessionStorage.setItem(seedKey, "1");
  }, { key: SAVE_KEY, seedKey: SEED_KEY, save });
}

export async function bootGame(page: Page, save: StoredGameStateV3) {
  await seedSave(page, save);
  await page.goto("/");
  await continueGame(page);
}

async function continueGame(page: Page) {
  await scene(page, "intro");
  await expect(game(page)).toHaveAttribute("aria-busy", "false", { timeout: 30000 });
  await page.keyboard.press("Enter");
}

export async function reloadGame(page: Page) {
  await page.reload();
  await continueGame(page);
}

/** Answer the actual localized question, supporting randomized decks and both input types. */
export async function answerBattle(page: Page, monsterId: string, pass = true) {
  const pack = await loadMixedQuizPack(findStage(monsterId).monster.quizPackId);
  const controls = page.locator(".battle-controls");
  await expect(controls).toBeVisible();
  for (let i = 0; i < pack.questions.length && await game(page).getAttribute("data-scene") === "code-battle"; i++) {
    const prompt = await controls.locator(".battle-prompt").innerText();
    const question = pack.questions.find(({ prompt: copy }) => copy.en === prompt || copy.ko === prompt);
    if (!question) throw new Error(`Unexpected prompt: ${prompt}`);
    if (question.type === "freeText") {
      await controls.getByRole("textbox").fill(pass ? question.acceptedAnswers[0] : "definitely-wrong-answer");
      await controls.getByRole("button", { name: /^(SUBMIT|제출)$/ }).click();
    } else {
      const answer = question.choices[pass ? question.answerIndex : (question.answerIndex + 1) % question.choices.length];
      const text = question.prompt.en === prompt ? answer.en : answer.ko;
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      await controls.getByRole("button", { name: new RegExp(escaped + "$") }).click();
    }
    await controls.getByRole("button", { name: /^(NEXT QUESTION|SHOW RESULT|다음 문제|결과 확인)$/ }).click();
    await frames(page);
  }
  await scene(page, "capture-quiz");
}

export async function confirmResult(page: Page) {
  for (let y = 505; y >= 280; y -= 10) {
    if (await game(page).getAttribute("data-scene") !== "capture-quiz") return;
    await clickGame(page, 480, y);
  }
  await expect(game(page)).not.toHaveAttribute("data-scene", "capture-quiz");
}
