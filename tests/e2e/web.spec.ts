import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { makePdf } from "../fixtures/make-pdf";

test.describe("web", () => {
  test("/merge-pdf/ 에서 병합이 브라우저 안에서 동작한다", async ({ page }) => {
    await page.goto("/merge-pdf/");
    await expect(page.locator("h1")).toHaveText(/Merge PDF/);

    await page.getByTestId("file-input").setInputFiles([
      { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(3, "a")) },
      { name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(2, "b")) },
    ]);
    await page.getByTestId("run").click();
    await page.getByTestId("download").waitFor();
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("download").click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);

    const doc = await PDFDocument.load(Buffer.concat(chunks));
    expect(doc.getPageCount()).toBe(5);
  });

  test("/ko/merge-pdf/ 의 H1 은 한국어이고 hreflang 이 양쪽을 가리킨다", async ({ page }) => {
    await page.goto("/ko/merge-pdf/");
    await expect(page.locator("h1")).toHaveText("PDF 병합");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/merge-pdf\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveAttribute("href", /\/ko\/merge-pdf\/$/);
  });

  test("사이트맵과 robots 가 제공된다", async ({ request }) => {
    expect((await request.get("/sitemap-index.xml")).status()).toBe(200);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
  });

  test("375px 에서 가로 스크롤이 없다", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/compress-pdf/");
    await page.getByTestId("tool-compress-pdf").waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("JSON-LD 가 SoftwareApplication 이다", async ({ page }) => {
    await page.goto("/merge-pdf/");
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(json ?? "{}")).toMatchObject({ "@type": "SoftwareApplication", name: "Merge PDF" });
  });
});
