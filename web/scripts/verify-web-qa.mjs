import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const base = "http://localhost:3002";
const evidence = new URL("../../mobile/.tmp-qa/", import.meta.url);
const evidencePath = (name) => fileURLToPath(new URL(name, evidence));
await fs.mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const menu = async () => {
    await page.goto(`${base}/qa`);
    await expect(page.locator("main h1")).toBeVisible({ timeout: 60_000 });
    await expect(page.locator("button[data-preset]")).toHaveCount(16);
  };
  const click = async (x, y) => {
    const canvas = page.locator(".pixel-canvas canvas");
    const box = await canvas.boundingBox();
    assert.ok(box);
    await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } });
  };
  const game = page.getByRole("application");
  await menu();
  await page.screenshot({ path: evidencePath("web-qa-menu.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: evidencePath("web-qa-menu-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  // These writes occur only in an isolated Playwright browser context on the QA origin.
  const original = { version: 3, progress: { captures: [{ id: "qa-prior-unknown", capturedAt: "2026-10-27T00:00:00.000Z" }], careers: [] }, player: { primaryJobId: "junior", secondaryJobId: null, tertiaryJobId: null }, ui: { tutorialOnboardingSeen: true, locale: "ko" } };
  await page.evaluate((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), original);
  await page.locator('[data-preset="open-source:orchestration"]').click();
  await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 60_000 });
  await menu();
  await page.locator('[data-action="restore"]').click();
  await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 30_000 });
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")));
  assert.ok(restored.progress.captures.some(({ id }) => id === "qa-prior-unknown"));
  await menu();
  const ids = await page.locator("button[data-preset]").evaluateAll((buttons) => buttons.map((button) => button.dataset.preset));
  for (const [index, id] of ids.entries()) {
    const locale = index % 2 ? "en" : "ko";
    await page.locator("select").selectOption(locale);
    await page.locator(`[data-preset="${id}"]`).click();
    await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 30_000 });
    const save = await page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3")));
    assert.equal(save.ui.locale, locale);
    await page.keyboard.press("Enter");
    const expedition = id.startsWith("open-source:");
    const promotion = id.startsWith("promotion:");
    await expect(game).toHaveAttribute("data-scene", expedition ? "open-source-chapter" : promotion ? "promotion-chapter" : "world-map", { timeout: 20_000 });
    if (expedition || promotion) {
      await click(expedition ? 718 : 742, 509);
      await expect(page.locator(".battle-controls")).toBeVisible({ timeout: 20_000 });
    }
    if (id === "open-source:orchestration") await page.screenshot({ path: evidencePath("web-qa-airflow-ready.png") });
    if (id === "dex") {
      assert.equal(save.progress.captures.length, 174);
      await click(480, 516);
      await expect(game).toHaveAttribute("data-scene", "codigdex");
    }
    console.log(`QA starting state passed: ${id} (${locale})`);
    await page.getByRole("link", { name: /QA/ }).click();
    await expect(page.locator("button[data-preset]")).toHaveCount(16);
  }
  assert.deepEqual(errors, []);
  console.log("Verified 16 QA starting states, live battles, full dex, bilingual selection, backup restore and narrow layout.");
} finally { await browser.close(); }
