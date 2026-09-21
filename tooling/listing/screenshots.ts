/**
 * 스토어용 스크린샷 1280×800 을 각 확장의 tools 페이지에서 찍는다.
 * 사전 조건: apps/ext-<suite>/.output/chrome-mv3 빌드. 출력: dist/listing/<suite>/screenshots/ 아래 png
 * 실행: pnpm --filter @filekit/tooling screenshots
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SUITES: Record<string, string[]> = {
  pdf: ["merge-pdf", "compress-pdf", "split-pdf", "pdf-to-images", "rotate-pdf"],
  image: ["convert-image", "heic-to-jpg", "compress-image", "resize-image"],
  audio: ["convert-audio", "mp4-to-mp3", "trim-audio", "compress-audio"],
};

for (const [suite, tools] of Object.entries(SUITES)) {
  const extPath = path.join(ROOT, `apps/ext-${suite}/.output/chrome-mv3`);
  if (!fs.existsSync(path.join(extPath, "manifest.json"))) { console.log("skip (no build):", suite); continue; }
  const out = path.join(ROOT, "dist/listing", suite, "screenshots");
  fs.mkdirSync(out, { recursive: true });
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), "ff-shot-")), {
    channel: "chromium", headless: true, viewport: { width: 1280, height: 800 },
    args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
  });
  const p0 = await context.newPage(); await p0.goto("chrome://extensions");
  const id = await p0.evaluate(() => document.querySelector("extensions-manager")?.shadowRoot?.querySelector("extensions-item-list")?.shadowRoot?.querySelector("extensions-item")?.getAttribute("id") ?? "");
  await p0.close();
  for (const [i, tool] of tools.entries()) {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${id}/tools.html?tool=${tool}`);
    await page.getByTestId(`tool-${tool}`).waitFor();
    await page.screenshot({ path: path.join(out, `${i + 1}-${tool}.png`) });
    await page.close();
  }
  await context.close();
  console.log("wrote", out);
}
