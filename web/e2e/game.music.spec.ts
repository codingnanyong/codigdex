import { expect, test } from "@playwright/test";
import { continueGame, scene, openGameMenu } from "../test-support/game";
import { bootGame, clickGame, answerBattle } from "../test-support/game";
import { webQAPresets } from "../lib/qa/presets";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { careerCheckpointLayout } from "../lib/phaser/worldMap/careerCheckpointLayout";
import { pathToFileURL } from "node:url";
import path from "node:path";

test("plays regional music after input and keeps persisted mute in fullscreen", async ({ page }) => {
  test.setTimeout(90000);
  const requests: string[] = [];
  page.on("request", request => { if (request.url().includes("/audio/music/")) requests.push(request.url()); });
  await page.goto("/"); await scene(page, "intro");
  const music = page.locator("button[data-music-region]");
  await expect(music).toHaveAttribute("data-music-region", "hub:title");
  expect(requests).toHaveLength(0);
  await openGameMenu(page);
  await music.click();
  await expect(music).toHaveAttribute("data-music-playing", "true", { timeout: 15000 });
  const dialog = page.getByRole("dialog", { name: "지역의 선율" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("slider").fill("50");
  await dialog.getByRole("button", { name: "BGM 끄기", exact: true }).click();
  await expect(music).toHaveAttribute("data-music-playing", "false");
  await page.keyboard.press("Escape");
  await page.getByRole("application").focus();
  await continueGame(page); await scene(page, "world-map");
  await expect(music).toHaveAttribute("data-music-region", "hub:world");
  await openGameMenu(page); await music.click();
  await dialog.getByRole("button", { name: "BGM 켜기", exact: true }).click();
  await expect(music).toHaveAttribute("data-music-playing", "true");
  await page.keyboard.press("Escape");
  await openGameMenu(page);
  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await page.getByRole("button", { name: "전체화면", exact: true }).click();
    await openGameMenu(page); await music.click(); await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(el => document.fullscreenElement?.contains(el))).toBe(true);
    await page.keyboard.press("Escape");
  }
  await page.reload(); await scene(page, "intro");
  await openGameMenu(page); await music.click();
  await expect(dialog.getByRole("slider")).toHaveValue("50");
  await dialog.getByRole("button", { name: "BGM 끄기", exact: true }).click();
  await page.reload(); await scene(page, "intro");
  await openGameMenu(page);
  await expect(music).toHaveAttribute("data-music-playing", "false");
  await music.click();
  await dialog.getByRole("button", { name: "BGM 켜기", exact: true }).click();
  await expect(music).toHaveAttribute("data-music-playing", "true", { timeout: 15000 });
});

test("keeps the regional theme through its battle and capture result", async ({ page }) => {
  test.setTimeout(90000);
  const requests: string[] = [];
  page.on("request", request => { if (request.url().includes("/audio/music/")) requests.push(request.url()); });
  await bootGame(page, webQAPresets("en").find(({ id }) => id === "encounter:devops")!.save);
  await scene(page, "world-map");
  const region = CAREER_PATHS.devops.regions.find(({ id }) => id === "network")!;
  await clickGame(page, region.lift.x, region.lift.y); await scene(page, "career-region");
  const music = page.locator("button[data-music-region]");
  await expect(music).toHaveAttribute("data-music-region", "career:devops:network");
  await expect(music).toHaveAttribute("data-music-playing", "true", { timeout: 15000 });
  const point = careerCheckpointLayout("devops", "network")[0];
  await clickGame(page, point.x, point.y); await scene(page, "code-battle");
  await expect(music).toHaveAttribute("data-music-region", "career:devops:network");
  await answerBattle(page, "packet-crab");
  await expect(music).toHaveAttribute("data-music-region", "career:devops:network");
  expect(requests.filter(url => url.includes("career--devops--network"))).toHaveLength(1);
});

test("offers all 79 tracks in the listening catalog", async ({ page }) => {
  await page.goto(pathToFileURL(path.resolve("../qa/bgm/index.html")).href);
  await expect(page.locator("audio")).toHaveCount(79);
  await page.locator("#query").fill("career:devops:network");
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("패킷 바람의 다리");
  const audio = page.locator("audio");
  await audio.evaluate((element: HTMLAudioElement) => element.load());
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.duration)).toBeGreaterThan(28);
  await audio.click({ position: { x: 20, y: 25 } });
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await page.screenshot({ path: "../qa-results/bgm-catalog.png" });
});
