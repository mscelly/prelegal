import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Test the static build served by the real backend. CI builds in an earlier step.
  webServer: {
    command: `${process.env.CI ? "" : "npm run build && "}cd ../backend && uv run uvicorn app.main:app --port ${port}`,
    env: { STATIC_DIR: "../frontend/out" },
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
