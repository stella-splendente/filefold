import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { makePdf, toBlob } from "../../../../tests/fixtures/make-pdf";
import { rotatePdf } from "./rotate";

async function angles(blob: Blob): Promise<number[]> {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  return doc.getPages().map((p) => p.getRotation().angle);
}

describe("rotatePdf", () => {
  it("모든 페이지를 90도 회전한다", async () => {
    const result = await rotatePdf(toBlob(await makePdf(3)), 90);

    expect(await angles(result.blob)).toEqual([90, 90, 90]);
    expect(result.filename).toBe("rotated.pdf");
  });

  it("지정한 페이지만 회전한다", async () => {
    const result = await rotatePdf(toBlob(await makePdf(3)), 180, [2]);

    expect(await angles(result.blob)).toEqual([0, 180, 0]);
  });

  it("범위 밖 페이지는 INTERNAL", async () => {
    await expect(rotatePdf(toBlob(await makePdf(2)), 90, [3])).rejects.toMatchObject({ code: "INTERNAL" });
  });
});
