import { expect, test } from "@playwright/test";

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

  await expect(page.getByRole("heading", { name: "CODIGDEX" })).toBeVisible();
  const canvas = page.locator(".pixel-canvas canvas");
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  await expect(canvas).toHaveAttribute("width", "960");
  await expect(canvas).toHaveAttribute("height", "540");
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
  await expect(page.getByText("A pixel-art coding game where you collect concepts in a dex")).toBeVisible();
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
