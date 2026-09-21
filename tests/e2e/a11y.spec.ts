import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/merge-pdf/", "/ko/convert-image/", "/mp4-to-mp3/", "/license/"];

for (const path of PAGES) {
  test(`a11y ${path}: serious/critical 위반 없음`, async ({ page }) => {
    await page.goto(path);
    if (path !== "/" && !path.includes("license")) await page.getByTestId(/tool-/).first().waitFor();
    const results = await new AxeBuilder({ page }).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("드롭존은 키보드로 조작되고 진행 상태는 aria-live 로 알린다", async ({ page }) => {
  await page.goto("/merge-pdf/");
  const drop = page.getByRole("button", { name: /Drop files/i });
  await drop.focus();
  await expect(drop).toBeFocused();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  expect(await chooser).toBeTruthy();
  await page.getByTestId("file-input").setInputFiles([{ name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") }]);
  await expect(page.locator("[aria-live=polite]").first()).toContainText("a.pdf");
});
