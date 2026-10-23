import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const results = process.env.QA_RESULTS_DIR ?? path.resolve(import.meta.dirname, "../qa-results/web");
export default defineConfig({
  testDir: "./home-e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: path.join(results, "artifacts"),
  reporter: [["list"], ["junit", { outputFile: path.join(results, "junit.xml") }], ["html", { outputFolder: path.join(results, "html"), open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3002", locale: "en-US", trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 3002",
    url: "http://127.0.0.1:3002",
    reuseExistingServer: false,
    timeout: 120000,
    env: { NEXT_PUBLIC_E2E: "1", NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
