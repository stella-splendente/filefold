import { degrees } from "pdf-lib";
import type { JobResult } from "../types";
import { assertPagesInRange, loadPdf, pdfBlob } from "./load";

export type RotationDegrees = 90 | 180 | 270;

/** pages 를 생략하면 전체 페이지를 회전한다. 기존 회전 각도에 더한다. */
export async function rotatePdf(file: Blob, by: RotationDegrees, pages?: number[]): Promise<JobResult> {
  const doc = await loadPdf(file);
  const all = doc.getPages();
  const targets = pages ?? all.map((_, i) => i + 1);
  assertPagesInRange(targets, all.length);

  for (const n of targets) {
    const page = all[n - 1];
    page.setRotation(degrees((page.getRotation().angle + by) % 360));
  }

  return { blob: pdfBlob(await doc.save()), filename: "rotated.pdf" };
}
