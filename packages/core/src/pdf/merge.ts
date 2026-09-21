import { PDFDocument } from "pdf-lib";
import { CoreError, noProgress, type JobResult, type OnProgress } from "../types";
import { loadPdf, pdfBlob } from "./load";

export async function mergePdfs(files: Blob[], onProgress: OnProgress = noProgress): Promise<JobResult> {
  if (files.length === 0) throw new CoreError("INTERNAL", "병합할 파일이 없습니다");

  const sources = [];
  for (const file of files) sources.push(await loadPdf(file));
  const total = sources.reduce((n, doc) => n + doc.getPageCount(), 0);

  const out = await PDFDocument.create();
  let done = 0;
  for (const src of sources) {
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const page of pages) {
      out.addPage(page);
      onProgress({ done: ++done, total });
    }
  }

  return { blob: pdfBlob(await out.save()), filename: "merged.pdf", meta: { pages: total } };
}
