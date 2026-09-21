import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { pngBlob } from "../../../../tests/fixtures/make-png";
import { imagesToPdf, pdfToImages } from "./images";

describe("imagesToPdf", () => {
  it("이미지마다 페이지 하나를 만든다", async () => {
    const result = await imagesToPdf([pngBlob(), pngBlob()]);

    const doc = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getPage(0).getWidth()).toBe(1);
    expect(result.filename).toBe("images.pdf");
  });

  it("a4 옵션이면 페이지 크기가 A4 다", async () => {
    const result = await imagesToPdf([pngBlob()], { pageSize: "a4" });

    const doc = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(Math.round(doc.getPage(0).getWidth())).toBe(595);
  });

  it("png/jpg 가 아니면 UNSUPPORTED_FORMAT", async () => {
    await expect(imagesToPdf([new Blob([new Uint8Array([1])], { type: "image/gif" })])).rejects.toMatchObject({
      code: "UNSUPPORTED_FORMAT",
    });
  });
});

describe("pdfToImages (node)", () => {
  it("OffscreenCanvas 가 없는 환경이면 UNSUPPORTED_FORMAT", async () => {
    await expect(pdfToImages(pngBlob(), { format: "png", dpi: 72 })).rejects.toMatchObject({ code: "UNSUPPORTED_FORMAT" });
  });
});
