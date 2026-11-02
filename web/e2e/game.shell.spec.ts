import { gameViewport } from "../lib/phaser/gameViewport";
import { openGameMenu } from "../test-support/game";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { expect, test } from "@playwright/test";

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
    const playfield = gameViewport(viewport.width, viewport.height);
    expect(toolbar!.x).toBeGreaterThanOrEqual(playfield.x);
    expect(toolbar!.y).toBeGreaterThanOrEqual(playfield.y);
    expect(toolbar!.x + toolbar!.width).toBeLessThanOrEqual(viewport.width - playfield.x);
    expect(toolbar!.y + toolbar!.height).toBeLessThanOrEqual(viewport.height - playfield.y);
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
    }
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
    expect(panel!.y).toBeGreaterThanOrEqual(toolbar!.y + toolbar!.height);
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
    await expect.poll(async () => {
      const camera = await page.locator(".pixel-canvas canvas").boundingBox();
      return camera!.width === viewport.width && camera!.height === viewport.height;
    }).toBe(true);
    expect(errors).toEqual([]);
  });
}
