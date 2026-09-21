import { PDFDocument } from "pdf-lib";
import { CoreError, type JobResult } from "../types";
import { assertPagesInRange, loadPdf, pdfBlob } from "./load";

/** order 는 1-based 전체 순열이어야 한다. */
export async function reorderPages(file: Blob, order: number[]): Promise<JobResult> {
  const src = await loadPdf(file);
  const count = src.getPageCount();
  assertPagesInRange(order, count);
  if (order.length !== count || new Set(order).size !== count) {
    throw new CoreError("INTERNAL", `순서는 1..${count} 를 정확히 한 번씩 포함해야 합니다`);
  }

  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, order.map((n) => n - 1));
  for (const page of copied) out.addPage(page);
  return { blob: pdfBlob(await out.save()), filename: "reordered.pdf" };
}

export async function deletePages(file: Blob, pages: number[]): Promise<JobResult> {
  const doc = await loadPdf(file);
  const count = doc.getPageCount();
  assertPagesInRange(pages, count);
  const remove = new Set(pages);
  if (remove.size >= count) throw new CoreError("INTERNAL", "모든 페이지를 삭제할 수는 없습니다");

  for (let i = count - 1; i >= 0; i--) {
    if (remove.has(i + 1)) doc.removePage(i);
  }
  return { blob: pdfBlob(await doc.save()), filename: "pages-removed.pdf" };
}
