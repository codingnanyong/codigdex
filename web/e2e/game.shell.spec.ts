import { openGameMenu, continueGame, scene, bootGame, clickGame } from "../test-support/game";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { expect, test } from "@playwright/test";
import { webQAPresets } from "../lib/qa/presets";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { careerCheckpointLayout } from "../lib/phaser/worldMap/careerCheckpointLayout";

for (const locale of ["ko", "en"] as const) for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`integrates toolbar and game into the viewport at ${viewport.width}x${viewport.height} (${locale})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), createEmptySave(locale));
    await page.goto("/");
    const game = page.getByRole("application");
    await expect(game).toHaveAttribute("aria-busy", "false", { timeout: 30000 });
    expect(await page.evaluate(() => document.fonts.check("14px Galmuri7"))).toBe(true);
    const shell = await page.locator(".game-shell").boundingBox();
    expect(shell).toEqual({ x: 0, y: 0, ...viewport });
    const toolbar = await page.locator(".game-toolbar").boundingBox();
    const canvas = await page.locator(".pixel-canvas canvas").boundingBox();
    expect(canvas).toEqual({ x: 0, y: 0, ...viewport });
    expect(toolbar!.x).toBeGreaterThanOrEqual(canvas!.x);
    expect(toolbar!.y).toBeGreaterThanOrEqual(canvas!.y);
    // The rail follows the left safe edge, independent of camera letterboxing.
    expect(toolbar!.x).toBeLessThanOrEqual(16);
    expect(toolbar!.y).toBeLessThanOrEqual(16);
    expect(toolbar!.x + toolbar!.width).toBeLessThanOrEqual(80);
    expect(toolbar!.y + toolbar!.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.locator(".game-toolbar h1, .game-toolbar .game-brand")).toHaveCount(0);
    expect(await page.locator(".game-backdrop").evaluate((el) => getComputedStyle(el).backgroundImage)).not.toContain("blob:");
    const background = await page.locator(".game-backdrop").boundingBox();
    expect(background!.x).toBeLessThanOrEqual(0);
    expect(background!.y).toBeLessThanOrEqual(0);
    expect(background!.x + background!.width).toBeGreaterThanOrEqual(viewport.width);
    expect(background!.y + background!.height).toBeGreaterThanOrEqual(viewport.height);
    await openGameMenu(page);
    const menu = await page.locator(".game-toolbar-actions").boundingBox();
    const buttons = page.locator(".game-toolbar-actions > button, .game-toolbar-actions .account-menu > button");
    const bounds = await buttons.evaluateAll((buttons) => buttons.map((button) => { const r = button.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }));
    for (const bound of bounds) {
      expect(bound.left).toBeGreaterThanOrEqual(0);
      expect(bound.right).toBeLessThanOrEqual(viewport.width);
      expect(bound.top).toBeGreaterThanOrEqual(menu!.y);
      expect(bound.bottom).toBeLessThanOrEqual(menu!.y + menu!.height);
      expect(bound.left).toBeCloseTo(bounds[0].left, 0);
      expect(bound.right - bound.left).toBe(viewport.width <= 600 || viewport.height <= 500 ? 44 : 48);
      expect(bound.bottom - bound.top).toBe(bound.right - bound.left);
    }
    const icons = await page.locator(".game-toolbar .game-tool-icon").evaluateAll((icons) => icons.map((icon) => { const r = icon.getBoundingClientRect(); return { width: r.width, height: r.height }; }));
    for (const icon of icons) expect(icon).toEqual({ width: 24, height: 24 });
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i], b = bounds[j];
      expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height);
    await openGameMenu(page);
    await page.getByRole("button", { name: locale === "ko" ? "계정 · 저장" : "ACCOUNT · SAVE", exact: true }).click();
    const account = page.getByRole("region", { name: locale === "ko" ? "계정과 저장" : "Account and save" });
    await expect(account).toBeVisible();
    const panel = await account.boundingBox();
    expect(panel!.x).toBeGreaterThanOrEqual(toolbar!.x + toolbar!.width + 8);
    expect(panel!.x).toBeGreaterThanOrEqual(0);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(viewport.width);
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(viewport.height);
    await account.getByRole("button", { name: locale === "ko" ? "닫기" : "CLOSE", exact: true }).click();
    await openGameMenu(page);
    await page.getByRole("button", { name: locale === "ko" ? "오픈소스 노트" : "OPEN-SOURCE NOTES", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(game).toHaveAttribute("data-scene", "intro");
    if (viewport.width === 1440 && await page.evaluate(() => document.fullscreenEnabled)) {
      await openGameMenu(page);
      await page.getByRole("button", { name: locale === "ko" ? "전체화면" : "FULLSCREEN", exact: true }).click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement?.className)).toBe("game-shell");
      await openGameMenu(page);
      await page.getByRole("button", { name: locale === "ko" ? "전체화면 종료" : "EXIT FULLSCREEN", exact: true }).click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
      await expect(game).toHaveAttribute("data-scene", "intro");
      await expect.poll(() => page.evaluate(() => window.innerHeight)).toBe(viewport.height);
      await expect.poll(() => page.locator(".game-shell").evaluate((el) => el.getBoundingClientRect().height)).toBe(viewport.height);
    }
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await page.screenshot({ path: `../qa-results/immersive-shell/shell-${viewport.width}x${viewport.height}-${locale}.png` });
    // An error notice must not shrink the game into a separate page panel.
    await page.evaluate(() => window.dispatchEvent(new Event("codigdex-save-error")));
    await expect(page.getByRole("button", { name: locale === "ko" ? "저장 실패 · 다시 저장" : "SAVE FAILED · RETRY", exact: true })).toBeVisible();
    const retry = await page.getByRole("button", { name: locale === "ko" ? "저장 실패 · 다시 저장" : "SAVE FAILED · RETRY", exact: true }).boundingBox();
    expect(retry!.x).toBeCloseTo(bounds[0].left, 0);
    expect(retry!.y + retry!.height).toBeLessThanOrEqual(viewport.height);
    await expect.poll(async () => {
      const camera = await page.locator(".pixel-canvas canvas").boundingBox();
      return camera!.width === viewport.width && camera!.height === viewport.height;
    }).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("uses left-rail home and settings actions without starting or resetting gameplay", async ({ page }) => {
  await page.goto("/");
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("aria-busy", "false", { timeout: 30000 });
  const home = page.getByRole("button", { name: "홈으로", exact: true });
  const settings = page.getByRole("button", { name: "설정", exact: true });
  await expect(home).toBeDisabled();
  await settings.click(); await scene(page, "settings");
  await expect(settings).toBeDisabled();
  await page.keyboard.press("Escape"); await scene(page, "intro");
  await continueGame(page); await scene(page, "world-map");
  const before = await page.evaluate(() => localStorage.getItem("codigdex:save:v3"));
  await expect(home).toBeEnabled(); await home.click(); await scene(page, "intro");
  expect(await page.evaluate(() => localStorage.getItem("codigdex:save:v3"))).toBe(before);
  await page.locator(".game-menu-toggle").click();
  await expect(home).not.toBeVisible();
  await page.locator(".game-menu-toggle").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".game-toolbar-actions")).toBeVisible();
  await scene(page, "intro");
  const accountButton = page.getByRole("button", { name: "계정 · 저장", exact: true });
  const account = page.getByRole("region", { name: "계정과 저장", exact: true });
  await accountButton.click();
  await expect(account.getByRole("button", { name: "닫기", exact: true })).toBeFocused();
  await page.locator(".game-menu-toggle").click();
  await expect(account).not.toBeVisible();
  await expect(page.locator(".game-menu-toggle")).toBeFocused();
  await openGameMenu(page);
  await expect(account).not.toBeVisible();
  await accountButton.focus(); await page.keyboard.press("Enter");
  await expect(account).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(account).not.toBeVisible();
  await expect(accountButton).toBeFocused();
  await scene(page, "intro");
});

test("keeps career terrain and checkpoint input together after changing aspect ratios", async ({ page }) => {
  const seed = webQAPresets("ko").find(({ id }) => id === "encounter:devops")!.save;
  await page.setViewportSize({ width: 1440, height: 1152 });
  await bootGame(page, seed);
  await scene(page, "world-map");
  const region = CAREER_PATHS.devops.regions[0];
  await clickGame(page, region.lift.x, region.lift.y);
  await scene(page, "career-region");
  for (const viewport of [{ width: 1440, height: 1152 }, { width: 1920, height: 1080 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => page.locator("canvas").evaluate((canvas) => {
      const buffer = canvas as HTMLCanvasElement;
      return [buffer.width, buffer.height];
    })).toEqual([viewport.width, viewport.height]);
    await page.screenshot({ path: `../qa-results/career-fit-${viewport.width}x${viewport.height}.png` });
  }
  const point = careerCheckpointLayout("devops", region.id)[0];
  await clickGame(page, point.x, point.y);
  await scene(page, "code-battle");
  await expect(page.locator(".battle-controls")).toBeVisible();
});
