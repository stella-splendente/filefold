import { chromium } from "@playwright/test";
import { makePdf } from "../../tests/fixtures/make-pdf.ts";
import { makeWav } from "../../tests/fixtures/make-wav.ts";
const base = process.argv[2] ?? "https://filefold.pages.dev";
const browser = await chromium.launch({ channel: "chromium" });
async function run(path, tool, files) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
  await page.goto(base + path);
  await page.locator(`[data-testid="tool-${tool}"]`).waitFor();
  await page.getByTestId("file-input").setInputFiles(files);
  const t0 = Date.now();
  await page.getByTestId("run").click();
  await page.getByTestId("download").waitFor({ timeout: 120000 });
  console.log(path, "ok in", ((Date.now() - t0) / 1000).toFixed(1) + "s", errors.length ? errors : "");
  await page.close();
}
await run("/merge-pdf/", "merge-pdf", [
  { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(2, "a")) },
  { name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(1, "b")) },
]);
await run("/ko/convert-audio/", "convert-audio", [{ name: "t.wav", mimeType: "audio/wav", buffer: Buffer.from(makeWav(1)) }]);
await browser.close();
