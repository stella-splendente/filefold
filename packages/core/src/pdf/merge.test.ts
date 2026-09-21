import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { makePdf, toBlob, pageWidths } from "../../../../tests/fixtures/make-pdf";
import { mergePdfs } from "./merge";
import { CoreError } from "../types";

describe("mergePdfs", () => {
  it("병합하면 페이지 수가 합쳐지고 순서가 유지된다", async () => {
    const a = toBlob(await makePdf(3, "a"));
    const b = toBlob(await makePdf(2, "b"));

    const result = await mergePdfs([a, b]);

    const doc = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(doc.getPageCount()).toBe(5);
    expect(await pageWidths(result.blob)).toEqual([101, 102, 103, 101, 102]);
    expect(result.blob.type).toBe("application/pdf");
    expect(result.filename).toBe("merged.pdf");
  });

  it("진행률을 페이지 단위로 보고한다", async () => {
    const a = toBlob(await makePdf(2));
    const seen: number[] = [];

    await mergePdfs([a, a], (p) => seen.push(p.done));

    expect(seen.at(-1)).toBe(4);
  });

  it("손상된 입력은 CORRUPT_FILE 오류를 낸다", async () => {
    const bad = new Blob([new Uint8Array([1, 2, 3])]);

    await expect(mergePdfs([bad])).rejects.toMatchObject({ code: "CORRUPT_FILE" } satisfies Partial<CoreError>);
  });

  it("입력이 없으면 INTERNAL 오류를 낸다", async () => {
    await expect(mergePdfs([])).rejects.toMatchObject({ code: "INTERNAL" });
  });
});
