import { PDFDocument } from "pdf-lib";
import { CoreError } from "../types";

/** pdf-lib 로 열고, 실패는 CORRUPT_FILE 로 통일한다. */
export async function loadPdf(file: Blob): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch (err) {
    throw new CoreError("CORRUPT_FILE", `PDF 를 열 수 없습니다: ${(err as Error).message}`);
  }
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export function assertPagesInRange(pages: number[], pageCount: number): void {
  const bad = pages.find((p) => !Number.isInteger(p) || p < 1 || p > pageCount);
  if (bad !== undefined) {
    throw new CoreError("INTERNAL", `페이지 ${bad} 는 범위 밖입니다 (총 ${pageCount} 페이지)`);
  }
}
