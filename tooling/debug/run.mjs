import { chromium } from "@playwright/test";
import { makePdf } from "../../tests/fixtures/make-pdf.ts";
const browser = await chromium.launch({ channel: "chromium" });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 600)); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 600)));
page.on("response", (r) => { if (r.status() >= 400) console.log("[http " + r.status() + "]", r.url()); });
await page.goto("http://127.0.0.1:4321/merge-pdf/");
await page.locator('[data-testid="tool-merge-pdf"]').waitFor();
await page.getByTestId("file-input").setInputFiles([
  { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(2, "a")) },
  { name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(1, "b")) },
]);
await page.getByTestId("run").click();
await page.waitForTimeout(6000);
console.log("download visible:", await page.getByTestId("download").count());
console.log("error visible:", await page.getByTestId("error").allTextContents());
console.log("quota:", await page.getByTestId("quota").allTextContents());
console.log("shell text:", (await page.getByTestId("tool-merge-pdf").innerText()).replace(/\n+/g, " | ").slice(0, 500));
console.log("progressbar:", await page.locator("[role=progressbar]").count(), "status:", await page.locator("[role=status]").count());
await browser.close();
