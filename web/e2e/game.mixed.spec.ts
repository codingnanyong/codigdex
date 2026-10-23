import { expect, test } from "@playwright/test";

test("plays mixed Web questions with hints, native text input and explicit feedback", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  await page.addInitScript(() => {
    localStorage.setItem("codigdex:save:v3", JSON.stringify({ version: 3, progress: { captures: [], careers: [] }, player: { primaryJobId: "junior", secondaryJobId: null, tertiaryJobId: null }, ui: { tutorialOnboardingSeen: true, locale: "en" } }));
  });
  await page.goto("/");
  const canvas = page.locator(".pixel-canvas canvas");
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("aria-busy", "false", { timeout: 15_000 });
  await expect(game).toHaveAttribute("data-scene", "intro");
  await page.keyboard.press("Enter");
  const clickGame = async (x: number, y: number) => {
    const box = (await canvas.boundingBox())!;
    await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } });
    // Phaser consumes pointer events on its next frame, after the browser click returns.
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  };
  await expect(game).toHaveAttribute("data-scene", "world-map", { timeout: 15_000 });
  await clickGame(480, 252);
  await clickGame(872, 516);
  await expect(page.locator(".battle-controls")).toBeVisible({ timeout: 15_000 });
  const controls = page.locator(".battle-controls");
  await expect(controls.locator(".battle-choices button")).toHaveCount(4);
  await controls.locator(".battle-choices button").first().click();
  await expect(controls.getByRole("status")).toContainText("Answer:");
  await controls.getByRole("button", { name: "NEXT QUESTION" }).click();
  const input = controls.getByRole("textbox", { name: "Short answer" });
  await expect(input).toBeVisible();
  const submit = controls.getByRole("button", { name: "SUBMIT" });
  await expect(submit).toBeDisabled();
  await controls.getByRole("button", { name: /^HINT/ }).click();
  await expect(controls.locator(".battle-hint")).toHaveCount(1);
  await input.fill("example");
  await expect(submit).toBeEnabled();
  await input.press("Enter");
  await expect(controls.getByRole("status")).toContainText("Attack strength:");
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.screenshot({ path: "../mobile/.tmp-qa/parity-web-battle.png" });
  expect(errors).toEqual([]);
});

test("keeps offline account controls usable when cloud configuration is absent", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "계정 · 저장" }).click();
  await expect(page.getByRole("region", { name: "계정과 저장" })).toContainText("계정 연동을 준비 중입니다");
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await expect(page.getByRole("application")).toHaveAttribute("aria-busy", "false");
});
