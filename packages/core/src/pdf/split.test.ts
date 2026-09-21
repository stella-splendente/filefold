import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { unzipSync } from "fflate";
import { makePdf, toBlob, pageWidths } from "../../../../tests/fixtures/make-pdf";
import { splitPdf } from "./split";

describe("splitPdf", () => {
  it("범위 하나면 pdf 하나를 돌려준다", async () => {
    const src = toBlob(await makePdf(5));

    const result = await splitPdf(src, [{ from: 2, to: 4 }], "doc");

    expect(result.blob.type).toBe("application/pdf");
    expect(result.filename).toBe("doc-2-4.pdf");
    expect(await pageWidths(result.blob)).toEqual([102, 103, 104]);
  });

  it("범위가 여러 개면 zip 으로 묶는다", async () => {
    const src = toBlob(await makePdf(5));

    const result = await splitPdf(src, [{ from: 1, to: 2 }, { from: 3, to: 5 }], "doc");

    expect(result.blob.type).toBe("application/zip");
    const entries = unzipSync(new Uint8Array(await result.blob.arrayBuffer()));
    expect(Object.keys(entries).sort()).toEqual(["doc-1-2.pdf", "doc-3-5.pdf"]);
    const second = await PDFDocument.load(entries["doc-3-5.pdf"]);
    expect(second.getPageCount()).toBe(3);
  });

  it("범위가 페이지 수를 넘으면 INTERNAL 오류에 페이지 수를 담는다", async () => {
    const src = toBlob(await makePdf(2));

    await expect(splitPdf(src, [{ from: 1, to: 3 }], "doc")).rejects.toMatchObject({
      code: "INTERNAL",
      message: expect.stringContaining("2"),
    });
  });

  it("손상된 입력은 CORRUPT_FILE", async () => {
    await expect(splitPdf(new Blob([new Uint8Array([9])]), [{ from: 1, to: 1 }], "x")).rejects.toMatchObject({ code: "CORRUPT_FILE" });
  });
});
