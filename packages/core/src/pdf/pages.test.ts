import { describe, it, expect } from "vitest";
import { makePdf, toBlob, pageWidths } from "../../../../tests/fixtures/make-pdf";
import { deletePages, reorderPages } from "./pages";

describe("reorderPages", () => {
  it("주어진 순열대로 페이지를 재배열한다", async () => {
    const result = await reorderPages(toBlob(await makePdf(3)), [3, 1, 2]);

    expect(await pageWidths(result.blob)).toEqual([103, 101, 102]);
    expect(result.filename).toBe("reordered.pdf");
  });

  it("순열이 아니면 INTERNAL", async () => {
    const src = toBlob(await makePdf(3));

    await expect(reorderPages(src, [1, 1, 2])).rejects.toMatchObject({ code: "INTERNAL" });
    await expect(reorderPages(src, [1, 2])).rejects.toMatchObject({ code: "INTERNAL" });
  });
});

describe("deletePages", () => {
  it("지정한 페이지를 제거한다", async () => {
    const result = await deletePages(toBlob(await makePdf(4)), [2, 4]);

    expect(await pageWidths(result.blob)).toEqual([101, 103]);
    expect(result.filename).toBe("pages-removed.pdf");
  });

  it("모든 페이지를 지우려 하면 INTERNAL", async () => {
    await expect(deletePages(toBlob(await makePdf(2)), [1, 2])).rejects.toMatchObject({ code: "INTERNAL" });
  });
});
