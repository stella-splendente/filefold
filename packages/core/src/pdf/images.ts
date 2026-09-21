import { PDFDocument, PageSizes } from "pdf-lib";
import { CoreError, noProgress, type JobResult, type OnProgress } from "../types";
import { zipResults } from "../zip";
import { pdfBlob } from "./load";

export interface ImagesToPdfOptions {
  pageSize?: "fit" | "a4";
}

function sniffImageType(bytes: Uint8Array): "png" | "jpeg" | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  return null;
}

/** png/jpg 를 페이지 하나씩 담은 PDF 로 만든다. fit 이면 이미지 크기, a4 면 A4 안에 비율 유지로 맞춘다. */
export async function imagesToPdf(files: Blob[], opts: ImagesToPdfOptions = {}): Promise<JobResult> {
  if (files.length === 0) throw new CoreError("INTERNAL", "변환할 이미지가 없습니다");
  const doc = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImageType(bytes);
    if (!kind) throw new CoreError("UNSUPPORTED_FORMAT", "PNG 또는 JPG 만 PDF 로 만들 수 있습니다");
    const image = kind === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    if (opts.pageSize === "a4") {
      const [w, h] = PageSizes.A4;
      const scale = Math.min(w / image.width, h / image.height, 1);
      const dw = image.width * scale;
      const dh = image.height * scale;
      doc.addPage([w, h]).drawImage(image, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
    } else {
      doc.addPage([image.width, image.height]).drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
  }

  return { blob: pdfBlob(await doc.save()), filename: "images.pdf", meta: { pages: files.length } };
}

export interface PdfToImagesOptions {
  format: "png" | "jpeg";
  dpi: number;
  quality?: number; // jpeg 0..1
}

/** 브라우저 전용. pdf.js 로 각 페이지를 OffscreenCanvas 에 렌더해 zip 으로 묶는다. */
export async function pdfToImages(file: Blob, opts: PdfToImagesOptions, onProgress: OnProgress = noProgress): Promise<JobResult> {
  if (typeof OffscreenCanvas === "undefined") {
    throw new CoreError("UNSUPPORTED_FORMAT", "이 기능은 브라우저에서만 동작합니다");
  }
  const { renderPagesToBlobs } = await import("./render");
  const blobs = await renderPagesToBlobs(file, opts, onProgress);
  const ext = opts.format === "png" ? "png" : "jpg";
  const entries = [];
  for (const [i, blob] of blobs.entries()) {
    entries.push({ name: `page-${String(i + 1).padStart(3, "0")}.${ext}`, data: new Uint8Array(await blob.arrayBuffer()) });
  }
  return zipResults(entries, "pages.zip");
}
