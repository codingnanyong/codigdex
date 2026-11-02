import { test, expect } from "@playwright/test";
import { gameQAPresets } from "@codigdex/game-content/domain/qaPresets";
import { TERTIARY_JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { masterChapterFor } from "@codigdex/game-content/domain/masterChapters";
import { secondaryRegionsFor } from "@codigdex/game-content/domain/secondaryExploration";

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

test("regional evolution: failure, capture settlement and reload preserve the five-stage route", async ({ page }) => {
  test.setTimeout(120000);
  const save = gameQAPresets("en").find(({ id }) => id === "workshop:platform-engineer")!.save;
  const region = secondaryRegionsFor("platform-engineer")[0];
  await bootGame(page, save);
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", "secondary-region");
  await clickGame(page, 216, 511); await expect(game).toHaveAttribute("data-scene", "secondary-atlas");
  await page.keyboard.press("2"); await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene", "secondary-atlas");
  await page.keyboard.press("1"); await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene", "secondary-region");
  await clickGame(page,736,511);
  const workshop = page.locator(".career-workshop");
  await expect(workshop.locator("pre")).not.toBeEmpty();
  await workshop.getByRole("button", { name:"START EVOLUTION BATTLE", exact:true }).click();
  await answerBattle(page,region.chapter.stages[0].id,false);await confirmResult(page);
  expect((await readSave(page)).progress.projects ?? []).toEqual([]);
  await expect(game).toHaveAttribute("data-scene","secondary-region");
  for(const [index,monster] of region.chapter.stages.entries()) {
    await clickGame(page,736,511);await workshop.getByRole("button",{name:"START EVOLUTION BATTLE",exact:true}).click();
    await answerBattle(page,monster.id);await confirmResult(page);
    if(await game.getAttribute("data-scene")==="open-source-event")await clickGame(page,242,501);
    expect((await readSave(page)).progress.captures.some(({id})=>id===monster.id)).toBe(true);
    expect((await readSave(page)).progress.projects).toHaveLength(Math.min(index+1,4));
    if(index===1)await reloadGame(page);
    await expect(game).toHaveAttribute("data-scene","secondary-region");
  }
  await page.screenshot({path:"../qa-results/secondary-evolution-region-en.png"});
  await clickGame(page,216,511);await page.keyboard.press("2");await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene","secondary-region");
});
