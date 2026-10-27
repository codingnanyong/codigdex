import { test, expect } from "@playwright/test";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { OPEN_SOURCE_EXPEDITIONS } from "@codigdex/game-content/domain/openSourceChapters";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { loadMixedQuizPack } from "@codigdex/quiz-content";

for (const { chapter } of OPEN_SOURCE_EXPEDITIONS) test(`captures and restores every mission in ${chapter.id}`, async ({ page }) => {
  test.setTimeout(180_000);
  const save = createEmptySave("en");
  save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" }));
  save.ui.tutorialOnboardingSeen = true;
  await page.addInitScript((save) => {
    if (sessionStorage.getItem("expedition-seeded")) return;
    localStorage.setItem("codigdex:save:v3", JSON.stringify(save));
    sessionStorage.setItem("expedition-seeded", "1");
  }, save);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 20_000 });
  await page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true }).click();
  const firstCard = page.locator(`[data-project="${chapter.stages[0].id.slice(12)}"]`);
  await expect(firstCard.getByRole("button", { name: "STORY · START MISSION", exact: true })).toBeEnabled();
  if (chapter.stages[1]) await expect(page.locator(`[data-project="${chapter.stages[1].id.slice(12)}"]`).getByRole("button", { name: "STORY · START MISSION", exact: true })).toBeDisabled();
  await firstCard.getByRole("button", { name: "STORY · START MISSION", exact: true }).click();
  await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
  const canvas = page.locator(".pixel-canvas canvas");
  const click = async (x: number, y: number) => {
    const box = (await canvas.boundingBox())!;
    await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } });
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  };
  for (const monster of chapter.stages) {
    const pack = await loadMixedQuizPack(monster.quizPackId);
    await click(718, 509);
    const controls = page.locator(".battle-controls");
    await expect(controls).toBeVisible();
    for (let answered = 0; answered < 3; answered++) {
      const prompt = await controls.locator(".battle-prompt").innerText();
      const question = pack.questions.find(({ prompt: copy }) => copy.en === prompt);
      if (!question || question.type === "freeText") throw new Error(`Unexpected expedition prompt: ${prompt}`);
      const correct = question.choices[question.answerIndex].en;
      // Choice numbering is randomized by the real battle; match its answer text.
      const answer = controls.getByRole("button", { name: new RegExp(correct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") });
      await answer.click();
      await controls.getByRole("button", { name: /^(NEXT QUESTION|SHOW RESULT)$/ }).click();
    }
    await expect(game).toHaveAttribute("data-scene", "capture-quiz");
    for (let y = 505; y >= 290; y -= 12) {
      if (await game.getAttribute("data-scene") !== "capture-quiz") break;
      await click(480, y);
    }
    await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")!));
    expect(stored.progress.captures.some(({ id }: { id: string }) => id === monster.id)).toBe(true);
    expect(stored.player.primaryJobId).toBe("junior");
    expect(stored.player.secondaryJobId).toBeNull();
    // The seeded common path already earns JUNIOR MASTER; expeditions must not earn another career.
    expect(stored.progress.careers.some(({ id, masteredAt }: { id: string; masteredAt?: string }) => id !== "junior" && masteredAt)).toBe(false);
  }
  await page.screenshot({ path: `../mobile/.tmp-qa/expedition-${chapter.id.slice(12)}-complete-en.png` });
  await page.reload();
  await expect(game).toHaveAttribute("data-scene", "intro");
  await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")!));
  expect(stored.progress.captures.filter(({ id }: { id: string }) => id.startsWith("open-source:"))).toHaveLength(chapter.stages.length);
  // Replays use the saved record and never register a duplicate capture.
  await click(718, 509);
  await expect(page.locator(".battle-controls")).toBeVisible();
  await page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true }).click();
  await expect(page.getByRole("dialog").locator("article")).toHaveCount(38);
  await firstCard.getByRole("button", { name: "REPLAY MISSION", exact: true }).click();
  await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
  await expect(page.locator(".battle-controls")).toHaveCount(0);
  await click(240, 509);
  await expect(page.getByRole("dialog").locator("article")).toHaveCount(38);
  await page.keyboard.press("Escape");
  await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
  expect(errors).toEqual([]);
});

test("plays Korean failure, retry and capture on a narrow screen", async ({ page }) => {
  test.setTimeout(60_000);
  const save = createEmptySave("ko");
  save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" }));
  save.ui.tutorialOnboardingSeen = true;
  await page.addInitScript((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), save);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 20_000 });
  await page.getByRole("button", { name: "오픈소스 탐험", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("검색", { exact: true }).fill("airflow");
  await dialog.getByRole("button", { name: "이야기 · 의뢰 시작", exact: true }).click();
  await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
  const canvas = page.locator(".pixel-canvas canvas");
  const click = async (x: number, y: number) => {
    const box = (await canvas.boundingBox())!;
    await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } });
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  };
  const monster = OPEN_SOURCE_EXPEDITIONS.find(({ chapter }) => chapter.id === "open-source:orchestration")!.chapter.stages[0];
  const pack = await loadMixedQuizPack(monster.quizPackId);
  for (const succeed of [false, true]) {
    await click(718, 509);
    const controls = page.locator(".battle-controls");
    await expect(controls).toBeVisible();
    if (succeed) await page.screenshot({ path: "../mobile/.tmp-qa/expedition-battle-mobile-ko.png" });
    const total = succeed ? 3 : 2;
    for (let i = 0; i < total; i++) {
      const prompt = await controls.locator(".battle-prompt").innerText();
      const question = pack.questions.find(({ prompt: copy }) => copy.ko === prompt);
      if (!question || question.type === "freeText") throw new Error(`Unexpected Korean prompt: ${prompt}`);
      const choice = question.choices[succeed ? question.answerIndex : (question.answerIndex + 1) % 4].ko;
      await controls.getByRole("button", { name: new RegExp(choice.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") }).click();
      await controls.getByRole("button", { name: /^(다음 문제|결과 확인)$/ }).click();
    }
    await expect(game).toHaveAttribute("data-scene", "capture-quiz");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")!));
    expect(stored.progress.captures.some(({ id }: { id: string }) => id === monster.id)).toBe(succeed);
    for (let y = 505; y >= 290; y -= 12) {
      if (await game.getAttribute("data-scene") !== "capture-quiz") break;
      await click(480, y);
    }
    await expect(game).toHaveAttribute("data-scene", "open-source-chapter");
  }
  await page.screenshot({ path: "../mobile/.tmp-qa/expedition-complete-mobile-ko.png" });
});
