import { CoreError, noProgress, type JobResult, type OnProgress } from "../types";
import { imagesToPdf } from "./images";

export interface CompressPdfOptions {
  quality: number; // jpeg 0..1
  dpi: number;     // 72~150 권장
}

/**
 * 브라우저 전용. 페이지를 JPEG 로 래스터화한 뒤 다시 PDF 로 묶는다.
 * ponytail: 텍스트가 이미지가 되는 손실 압축. 객체 단위 재압축이 필요해지면 pdf.js 이미지 추출 방식으로 교체.
 */
export async function compressPdf(file: Blob, opts: CompressPdfOptions, onProgress: OnProgress = noProgress): Promise<JobResult> {
  if (typeof OffscreenCanvas === "undefined") {
    throw new CoreError("UNSUPPORTED_FORMAT", "이 기능은 브라우저에서만 동작합니다");
  }
  const { renderPagesToBlobs } = await import("./render");
  const pages = await renderPagesToBlobs(file, { format: "jpeg", dpi: opts.dpi, quality: opts.quality }, onProgress);
  const result = await imagesToPdf(pages);
  return { ...result, filename: "compressed.pdf", meta: { before: file.size, after: result.blob.size } };
}
