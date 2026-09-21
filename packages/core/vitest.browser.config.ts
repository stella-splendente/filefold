import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/** wasm 코덱·OffscreenCanvas 가 필요한 테스트는 실제 Chromium 에서 돈다. */
export default defineConfig({
  test: {
    include: ["src/**/*.browser.test.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: { channel: "chromium" } }),
      instances: [{ browser: "chromium" }],
    },
  },
  optimizeDeps: { exclude: ["pdfjs-dist", "@ffmpeg/ffmpeg", "@ffmpeg/core", "@ffmpeg/util", "@jsquash/jpeg", "@jsquash/png", "@jsquash/webp", "@jsquash/avif", "@jsquash/resize", "heic-to"] },
});
