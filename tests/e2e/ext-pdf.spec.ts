import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import path from "node:path";
import { launchWithExtension, openTool, runAndDownload } from "./helpers/extension";
import { makePdf } from "../fixtures/make-pdf";

const APP = path.resolve(__dirname, "../../apps/ext-pdf");

test.describe("ext-pdf", () => {
  test("merge-pdf 는 두 PDF 를 다섯 페이지로 합친다", async () => {
    const { context, extensionId } = await launchWithExtension(APP);
    const page = await openTool(context, extensionId, "merge-pdf");

    const out = await runAndDownload(page, [
      { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(3, "a")) },
      { name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(2, "b")) },
    ]);

    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(5);
    await context.close();
  });

  test("compress-pdf 는 브라우저에서 동작하고 결과가 PDF 다", async () => {
    const { context, extensionId } = await launchWithExtension(APP);
    const page = await openTool(context, extensionId, "compress-pdf");

    const out = await runAndDownload(page, [{ name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from(await makePdf(2, "z")) }]);

    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    await context.close();
  });

  test("무료 한도: 26MB 파일은 FILE_TOO_LARGE 안내가 뜬다", async () => {
    const { context, extensionId } = await launchWithExtension(APP);
    const page = await openTool(context, extensionId, "merge-pdf");

    await page.getByTestId("file-input").setInputFiles([{ name: "big.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(26 * 1024 * 1024) }]);
    await page.getByTestId("run").click();

    await expect(page.getByTestId("quota")).toContainText(/25 MB|25MB/);
    await context.close();
  });
});
