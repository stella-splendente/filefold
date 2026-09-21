import { chromium, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

export async function launchWithExtension(appDir: string): Promise<{ context: BrowserContext; extensionId: string }> {
  const extPath = path.resolve(appDir, ".output/chrome-mv3");
  if (!fs.existsSync(path.join(extPath, "manifest.json"))) {
    throw new Error(`확장 빌드가 없습니다: ${extPath}. 먼저 pnpm --filter <app> build 를 실행하세요.`);
  }
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "filekit-ext-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
  });
  const extensionId = await findExtensionId(context);
  return { context, extensionId };
}

async function findExtensionId(context: BrowserContext): Promise<string> {
  const page = await context.newPage();
  await page.goto("chrome://extensions");
  const id = await page.evaluate(() => {
    const mgr = document.querySelector("extensions-manager") as unknown as { shadowRoot: ShadowRoot } | null;
    const item = mgr?.shadowRoot?.querySelector("extensions-item-list")?.shadowRoot?.querySelector("extensions-item");
    return item?.getAttribute("id") ?? "";
  });
  await page.close();
  if (!id) throw new Error("확장 ID 를 찾지 못했습니다");
  return id;
}

export async function openTool(context: BrowserContext, extensionId: string, toolId: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/tools.html?tool=${toolId}`);
  await page.getByTestId(`tool-${toolId}`).waitFor();
  return page;
}

export async function runAndDownload(page: Page, files: { name: string; mimeType: string; buffer: Buffer }[]): Promise<Buffer> {
  await page.getByTestId("file-input").setInputFiles(files);
  await page.getByTestId("run").click();
  await page.getByTestId("download").waitFor();
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("download").click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}
