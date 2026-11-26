import sharp from "sharp";
import { gameViewport } from "../lib/phaser/gameViewport";
import { test, expect } from "@playwright/test";
import { gameQAPresets } from "@codigdex/game-content/domain/qaPresets";
import { secondaryRegionsFor } from "@codigdex/game-content/domain/secondaryExploration";
import { settleEvolutionPractice } from "@codigdex/game-content/domain/gameProgress";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { webBattleQuizPack, releaseHarborLesson } from "../lib/learning/releaseHarbor";
import { bootGame, clickGame, answerBattle, readSave } from "../test-support/game";

for (const locale of ["ko", "en"] as const) for (const level of [1, 5]) {
  test(`release harbor level ${level}: optional lesson, distinct questions and HP (${locale})`, async ({ page }) => {
    if (level === 5) await page.setViewportSize({ width: 844, height: 390 });
    let save = gameQAPresets(locale).find(p => p.id === "promotion:platform-engineer")!.save;
    const regions = secondaryRegionsFor("platform-engineer"), region = regions[0];
    const regionIds = new Set(regions.flatMap(r => r.chapter.stages.map(s => s.id)));
    save.progress.captures = save.progress.captures.filter(c => !regionIds.has(c.id));
    save.progress.projects = [];
    for (const monster of region.chapter.stages.slice(0, level - 1)) {
      save.progress.captures.push({ id: monster.id, capturedAt: "2026-11-26T00:00:00.000Z" });
      save = settleEvolutionPractice(save, monster.id);
    }
    const monster = region.chapter.stages[level - 1];
    save.ui.checkpointId = monster.id;
    await bootGame(page, save);
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "secondary-region");
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "secondary-region");
    await clickGame(page, 468, 511);
    const lesson = releaseHarborLesson(monster.id)!;
    const workshop = page.locator(".career-workshop");
    await expect(workshop.locator("h2")).toHaveText(lesson.goal[locale]);
    await expect(workshop.locator("pre")).toHaveText(lesson.example);
    await expect(workshop.locator("a")).toHaveAttribute("href", lesson.source);
    await workshop.getByRole("button", { name: /^(BACK TO MISSION MAP|의뢰 지도로 돌아가기)$/ }).click();
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "secondary-region");
    await expect(page.getByRole("application")).toHaveAttribute("data-scene", "secondary-region");
    await clickGame(page, 752, 511);
    const controls = page.locator(".battle-controls");
    await expect(controls).toHaveAttribute("data-battle-status", "active");
    await expect(workshop).toHaveCount(0);
    const pack = webBattleQuizPack(await loadMixedQuizPack(monster.quizPackId));
    const prompt = await controls.locator(".battle-prompt").innerText();
    const question = pack.questions.find(q => q.prompt[locale] === prompt)!;
    if (!question || question.type === "freeText") throw new Error("Expected the Web learning pilot");
    const wrong = question.choices[(question.answerIndex + 1) % 4][locale];
    await controls.getByRole("button", { name: new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") }).click();
    await expect(controls.locator(".battle-feedback")).toContainText(question.explanation![locale]);
    await expect(controls.locator(".battle-reference")).toHaveAttribute("href", lesson.source);
    const spare = level === 1 ? 0 : 1;
    await expect(controls.locator(".battle-progress")).toContainText(locale === "ko" ? `오답 여유 ${spare}회` : `MISTAKES LEFT ${spare}`);
    // The raw WebGL image previously contained the HUD while browser composition hid it.
    // Sample the visible status plate, rather than merely checking renderer configuration.
    const bounds = (await page.locator("canvas").boundingBox())!;
    const viewport = gameViewport(bounds.width, bounds.height);
    const pixel = await sharp(await page.screenshot()).extract({ left: Math.round(bounds.x + viewport.x + 330 * viewport.zoom), top: Math.round(bounds.y + viewport.y + 85 * viewport.zoom), width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    expect([...pixel]).toEqual([241, 228, 203]);
    await page.screenshot({ path: `../qa-results/web-learning/lv${level}-${locale}.png` });
    await controls.getByRole("button", { name: /^(NEXT QUESTION|다음 문제)$/ }).click();
    await answerBattle(page, monster.id);
    expect((await readSave(page)).progress.captures.some(c => c.id === monster.id)).toBe(true);
  });
}
