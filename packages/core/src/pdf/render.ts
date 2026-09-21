import { noProgress, type OnProgress } from "../types";
import type { PdfToImagesOptions } from "./images";

/** 브라우저 전용 모듈. pdf.js 는 여기서만 import 해서 node 테스트가 로드하지 않게 한다. */
export async function renderPagesToBlobs(file: Blob, opts: PdfToImagesOptions, onProgress: OnProgress = noProgress): Promise<Blob[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  const scale = opts.dpi / 72;
  const out: Blob[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale });
    const canvas = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: ctx, viewport }).promise;
    out.push(await canvas.convertToBlob({ type: `image/${opts.format}`, quality: opts.quality ?? 0.8 }));
    onProgress({ done: n, total: doc.numPages });
  }
  await task.destroy();
  return out;
}
