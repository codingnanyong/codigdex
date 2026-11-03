import { expect, test } from "../test-support/previewFixture";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { continueGame, openGameMenu, readSave, scene } from "../test-support/game";

test("boots the game shell and Phaser canvas", async ({ page }) => {
  const pageErrors: Error[] = [];
  const assetResponses: { status: number; type: string }[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  page.on("response", (response) => {
    if (new URL(response.url()).pathname.startsWith("/assets/")) {
      assetResponses.push({ status: response.status(), type: response.headers()["content-type"] ?? "" });
    }
  });

  const response = await page.goto("/");
  expect(response?.status(), "Game home must return HTTP 200").toBe(200);

  await expect(page).toHaveTitle("Codigdex");
  await expect(page.locator(".game-toolbar h1, .game-toolbar .game-brand")).toHaveCount(0);
  const canvas = page.locator(".pixel-canvas canvas");
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  expect(await canvas.evaluate(el => (el as HTMLCanvasElement).width)).toBe(await page.evaluate(() => innerWidth));
  expect(await canvas.evaluate(el => (el as HTMLCanvasElement).height)).toBe(await page.evaluate(() => innerHeight));
  await expect(page.getByRole("application", { name: "코딩덱스 코딩 교육 게임" })).toHaveAttribute(
    "aria-busy",
    "false",
    { timeout: 30_000 }
  );
  await expect(page.getByRole("status")).toContainText("게임을 시작할 준비가 되었습니다.", { timeout: 30_000 });
  expect(assetResponses.some(({ status, type }) => status === 200 && type.startsWith("image/")), "Game must load actual image assets").toBe(true);
  expect(assetResponses.filter(({ status }) => status >= 400), "Game assets must not fail").toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("restores saved progress and language after a reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "codigdex:save:v3",
      JSON.stringify({
        version: 3,
        progress: {
          captures: [{ id: "infinite-loop-slime", capturedAt: "2026-09-18T00:00:00.000Z" }],
          careers: [],
        },
        player: { primaryJobId: "junior", secondaryJobId: null, tertiaryJobId: null },
        ui: { tutorialOnboardingSeen: true, locale: "en" },
      })
    );
  });

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("application")).toHaveAttribute("aria-label", "Codigdex coding education game");
  await expect(page.getByRole("application", { name: "Codigdex coding education game" })).toHaveAttribute(
    "aria-busy",
    "false"
  );

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem("codigdex:save:v3") ?? "null"));
  expect(save.progress.captures).toContainEqual(
    expect.objectContaining({ id: "infinite-loop-slime" })
  );
});

test("enters the common world and returns home without losing progress", async ({ page }) => {
  const initial = createEmptySave("ko");
  initial.ui.tutorialOnboardingSeen = true;
  const capture = { id: "infinite-loop-slime", capturedAt: "2026-11-03T00:00:00.000Z" };
  initial.progress.captures.push(capture);
  await page.addInitScript((save) => localStorage.setItem("codigdex:save:v3", JSON.stringify(save)), initial);
  await page.goto("/");
  await continueGame(page);
  await scene(page, "world-map");
  const before = await readSave(page);
  expect(before.progress.captures).toContainEqual(expect.objectContaining(capture));
  await openGameMenu(page);
  await page.getByRole("button", { name: "홈으로", exact: true }).click();
  await scene(page, "intro");
  expect((await readSave(page)).progress).toEqual(before.progress);
});
