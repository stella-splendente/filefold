import { defineConfig } from "@playwright/test";
import fs from "node:fs";

const hasWeb = fs.existsSync("apps/web/dist");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { trace: "retain-on-failure" },
  projects: [
    { name: "ext-pdf", testMatch: /ext-pdf\.spec\.ts/ },
    { name: "ext-image", testMatch: /ext-image\.spec\.ts/ },
    { name: "ext-audio", testMatch: /ext-audio\.spec\.ts/ },
    { name: "web", testMatch: /(web|visual|a11y)\.spec\.ts/, use: { baseURL: "http://127.0.0.1:4321" } },
  ],
  webServer: hasWeb ? {
    command: "pnpm --filter web preview --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  } : undefined,
});
