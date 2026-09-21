import { PDFDocument } from "pdf-lib";
import { noProgress, type JobResult, type OnProgress, type PageRange } from "../types";
import { zipResults } from "../zip";
import { assertPagesInRange, loadPdf, pdfBlob } from "./load";

export async function splitPdf(
  file: Blob,
  ranges: PageRange[],
  baseName: string,
  onProgress: OnProgress = noProgress,
): Promise<JobResult> {
  const src = await loadPdf(file);
  const pageCount = src.getPageCount();
  assertPagesInRange(ranges.flatMap((r) => [r.from, r.to]), pageCount);

  const parts: { name: string; data: Uint8Array }[] = [];
  for (const [i, range] of ranges.entries()) {
    const out = await PDFDocument.create();
    const indices = Array.from({ length: range.to - range.from + 1 }, (_, k) => range.from - 1 + k);
    const pages = await out.copyPages(src, indices);
    for (const page of pages) out.addPage(page);
    parts.push({ name: `${baseName}-${range.from}-${range.to}.pdf`, data: await out.save() });
    onProgress({ done: i + 1, total: ranges.length });
  }

  if (parts.length === 1) return { blob: pdfBlob(parts[0].data), filename: parts[0].name };
  return zipResults(parts, `${baseName}-split.zip`);
}
