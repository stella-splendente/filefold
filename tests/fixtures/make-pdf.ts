import { PDFDocument, StandardFonts } from "pdf-lib";

/** 페이지마다 `${label}-${i}` 텍스트를 넣고, 페이지 폭을 100+i 로 달리해 순서 검증에 쓴다. */
export async function makePdf(pages: number, label = "p"): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([100 + i, 200]);
    page.drawText(`${label}-${i}`, { x: 10, y: 100, size: 12, font });
  }
  return doc.save();
}

export function toBlob(bytes: Uint8Array, type = "application/pdf"): Blob {
  return new Blob([bytes as BlobPart], { type });
}

export async function pageWidths(blob: Blob): Promise<number[]> {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  return doc.getPages().map((p) => p.getWidth());
}
