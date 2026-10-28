import { test, expect } from "@playwright/test";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { webQAPresets } from "../lib/qa/presets";

test("starts with a discovery notebook instead of a separate expedition menu", async ({ page }) => {
  await page.addInitScript((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), createEmptySave("en"));
  await page.goto("/");
  await expect(page.getByRole("application")).toHaveAttribute("data-scene", "intro", { timeout: 20000 });
  await page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true }).click();
  const notes = page.getByRole("dialog");
  await expect(notes).toContainText("No tools discovered yet");
  await expect(notes.locator("article")).toHaveCount(0);
  await expect(notes.getByRole("button", { name: /START MISSION|REPLAY MISSION/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("application")).toHaveAttribute("data-scene", "intro");
});

test("filters bilingual notes, identifies Hadoop components and restores focus without starting the game", async ({ page }) => {
  await page.addInitScript((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), webQAPresets("en").find(({ id }) => id === "dex")!.save);
  await page.goto("/");
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 20_000 });
  const launcher = page.getByRole("button", { name: "OPEN-SOURCE NOTES", exact: true });
  await launcher.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "OPEN-SOURCE FIELD NOTES" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("article")).toHaveCount(OPEN_SOURCE_CATALOG.length);
  await dialog.getByLabel("Search", { exact: true }).fill("airflow");
  await page.keyboard.press("Enter");
  await expect(dialog.locator("article")).toHaveCount(1);
  await expect(dialog.getByRole("heading", { name: "Apache Airflow", exact: true })).toBeVisible();
  await expect(dialog.getByRole("img", { name: "Airflow Windwing", exact: true })).toHaveJSProperty("naturalWidth", 256);
  await expect(game).toHaveAttribute("data-scene", "intro");
  await dialog.getByLabel("Search", { exact: true }).fill("");
  await dialog.getByRole("combobox", { name: "Ecosystem", exact: true }).selectOption("hadoop");
  const hdfs = dialog.locator('[data-project="hdfs"]');
  await expect(hdfs).toContainText("Component of: Apache Hadoop");
  await expect(dialog.locator('[data-project="hive"]')).not.toContainText("Component of:");
  await dialog.getByRole("button", { name: "Show all", exact: true }).click();
  await dialog.getByRole("combobox", { name: "Ecosystem", exact: true }).selectOption("streaming");
  await dialog.getByRole("combobox", { name: "Career path", exact: true }).selectOption("backend");
  await expect(dialog.locator("article")).toHaveCount(2);
  await dialog.getByLabel("Search", { exact: true }).fill("nothing-matches-this");
  await expect(dialog).toContainText("No matching discoveries");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
  await expect(game).toHaveAttribute("data-scene", "intro");
});

test("opens chapter-related notes, resumes its battle and keeps save progress unchanged", async ({ page }) => {
  const seed = createEmptySave("ko");
  const monsters = [...CHAPTERS.flatMap(({ stages }) => stages), ...[CAREER_PATHS.backend, CAREER_PATHS.devops].flatMap(({ regions }) => regions.flatMap(({ id }) => monstersForCareerRegion(id)))];
  seed.progress.captures = [...new Set(monsters.map(({ id }) => id))].map((id) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" }));
  seed.player.primaryJobId = "backend";
  seed.progress.captures.push(...["argo-cd", "openlineage"].map((id) => ({ id: `open-source:${id}`, capturedAt: "2026-10-28T00:00:00.000Z" })));
  seed.ui.tutorialOnboardingSeen = true;
  await page.addInitScript((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), selectSecondaryCareer(seed, "platform-engineer"));
  await page.goto("/");
  const game = page.getByRole("application");
  await expect(game).toHaveAttribute("data-scene", "intro", { timeout: 20_000 });
  await page.keyboard.press("Enter");
  await expect(game).toHaveAttribute("data-scene", "promotion-chapter");
  const canvas = page.locator(".pixel-canvas canvas");
  const click = async (x: number, y: number) => { const box = (await canvas.boundingBox())!; await canvas.click({ position: { x: x * box.width / 960, y: y * box.height / 540 } }); };
  const before = await page.evaluate(() => localStorage.getItem("codigdex:save:v3"));
  await click(300, 455);
  const dialog = page.getByRole("dialog", { name: "발견한 오픈소스 노트" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("article")).toHaveCount(1);
  await expect(dialog.getByRole("heading", { name: "Argo CD", exact: true })).toBeVisible();
  await expect(dialog.getByRole("img", { name: "출항 보따리 소라게", exact: true })).toHaveJSProperty("naturalWidth", 256);
  await page.screenshot({ path: "../mobile/.tmp-qa/open-source-related-ko.png" });
  await dialog.getByRole("button", { name: "오픈소스 노트 닫기", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("codigdex:save:v3"))).toBe(before);
  await click(742, 509);
  const controls = page.locator(".battle-controls");
  await expect(controls).toBeVisible();
  const prompt = await controls.locator(".battle-prompt").innerText();
  const beforeBattleNotes = await page.evaluate(() => localStorage.getItem("codigdex:save:v3"));
  await page.getByRole("button", { name: "오픈소스 노트", exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("검색", { exact: true }).fill("계보");
  await expect(dialog.getByRole("heading", { name: "OpenLineage", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(controls.locator(".battle-prompt")).toHaveText(prompt);
  expect(await page.evaluate(() => localStorage.getItem("codigdex:save:v3"))).toBe(beforeBattleNotes);
});

test("keeps notes readable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("application")).toHaveAttribute("data-scene", "intro", { timeout: 20_000 });
  await page.getByRole("button", { name: /오픈소스 노트|OPEN-SOURCE NOTES/, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("input").fill("Kafka");
  await page.screenshot({ path: "../mobile/.tmp-qa/open-source-mobile-ko.png" });
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
});

test("serves every open-source character as a real PNG", async ({ request }) => {
  for (const entry of OPEN_SOURCE_CATALOG) {
    const response = await request.get(`/assets/${entry.character.assetKey}`);
    expect(response.ok(), entry.id).toBe(true);
    expect(response.headers()["content-type"], entry.id).toContain("image/png");
    const image = await response.body();
    expect([...image.subarray(0, 8)], entry.id).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  }
});
