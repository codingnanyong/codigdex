import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // These WebGL journeys share GPU resources; serialize their input and rendering.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseURL ?? "http://127.0.0.1:3001",
    locale: "ko-KR",
    // Authenticated traces can contain the deployment cookie or bootstrap header.
    trace: process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? "off" : "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Exercise ordinary journeys at the authored game resolution. The
        // shell suite explicitly covers desktop, portrait and landscape sizes;
        // those full-viewport checks still use their real renderbuffer sizes.
        viewport: { width: 960, height: 540 },
      },
    },
  ],
  webServer: externalBaseURL ? undefined : {
    command: "npm run dev",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
