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
    // 시각 회귀 스냅샷은 OS 별 글꼴 차이로 CI(Linux)에서 어긋나므로 로컬(macOS)에서만 비교한다.
    { name: "web", testMatch: /(web|visual|a11y)\.spec\.ts/, testIgnore: process.env.CI ? /visual\.spec\.ts/ : [], use: { baseURL: "http://127.0.0.1:4321" } },
  ],
  webServer: hasWeb ? {
    command: "pnpm --filter @filekit/ui exec vite preview --outDir ../../apps/web/dist --host 127.0.0.1 --port 4321 --strictPort",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  } : undefined,
});
