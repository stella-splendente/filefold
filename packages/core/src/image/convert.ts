import type { JobResult } from "../types";
import { decodeImage, sniffFormat, type ImageFormat } from "./decode";
import { EXT, encodeImage } from "./encode";

function stem(file: Blob & { name?: string }): string {
  return (file.name ?? "image").replace(/\.[^.]+$/, "") || "image";
}

export interface ConvertOptions { to: ImageFormat; quality: number }

export async function convertImage(file: Blob & { name?: string }, opts: ConvertOptions): Promise<JobResult> {
  const img = await decodeImage(file);
  const blob = await encodeImage(img, opts.to, opts.quality);
  return { blob, filename: `${stem(file)}.${EXT[opts.to]}`, meta: { before: file.size, after: blob.size, width: img.width, height: img.height } };
}

export interface CompressOptions { quality: number }

/** 원본 포맷 유지 (HEIC 는 JPEG 로). PNG 는 무손실이라 quality 를 무시하고 재인코딩만 한다. */
export async function compressImage(file: Blob & { name?: string }, opts: CompressOptions): Promise<JobResult> {
  const format = await sniffFormat(file);
  const result = await convertImage(file, { to: format, quality: opts.quality });
  return { ...result, filename: `${stem(file)}-compressed.${EXT[format]}` };
}
