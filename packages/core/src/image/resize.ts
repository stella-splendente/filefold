import { CoreError, type JobResult } from "../types";
import { decodeImage, sniffFormat } from "./decode";
import { EXT, encodeImage } from "./encode";

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit: "contain" | "cover";
  quality?: number;
}

function targetSize(w: number, h: number, opts: ResizeOptions): { w: number; h: number } {
  if (!opts.width && !opts.height) throw new CoreError("INTERNAL", "너비 또는 높이를 지정하세요");
  if (opts.width && !opts.height) return { w: opts.width, h: Math.max(1, Math.round((h * opts.width) / w)) };
  if (opts.height && !opts.width) return { w: Math.max(1, Math.round((w * opts.height) / h)), h: opts.height };
  const scale = opts.fit === "cover" ? Math.max(opts.width! / w, opts.height! / h) : Math.min(opts.width! / w, opts.height! / h);
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

export async function resizeImage(file: Blob & { name?: string }, opts: ResizeOptions): Promise<JobResult> {
  const img = await decodeImage(file);
  const { w, h } = targetSize(img.width, img.height, opts);
  const { default: resize } = await import("@jsquash/resize");
  const out = await resize(img, { width: w, height: h, method: "lanczos3", fitMethod: "stretch" });
  const format = await sniffFormat(file);
  const blob = await encodeImage(out, format, opts.quality ?? 0.85);
  const name = (file.name ?? "image").replace(/\.[^.]+$/, "") || "image";
  return { blob, filename: `${name}-${w}x${h}.${EXT[format]}`, meta: { width: w, height: h, before: file.size, after: blob.size } };
}
