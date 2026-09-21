import { test, expect } from "@playwright/test";

const PAGES = ["/merge-pdf/", "/", "/ko/merge-pdf/"];
const WIDTHS = [375, 768, 1440];

for (const path of PAGES) {
  for (const width of WIDTHS) {
    test(`visual ${path} @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      if (path !== "/" ) await page.getByTestId(/tool-/).first().waitFor();
      await expect(page).toHaveScreenshot(`${path.replace(/\//g, "_") || "home"}-${width}.png`, { fullPage: true, maxDiffPixelRatio: 0.02 });
    });
  }
}
