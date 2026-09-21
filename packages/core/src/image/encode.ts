import type { ImageFormat } from "./decode";

const MIME: Record<ImageFormat, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };
export const EXT: Record<ImageFormat, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };

/** jSquash wasm 코덱으로 인코딩. quality 는 0..1. */
export async function encodeImage(img: ImageData, format: ImageFormat, quality: number): Promise<Blob> {
  const q = Math.round(Math.min(1, Math.max(0, quality)) * 100);
  let bytes: ArrayBuffer;
  switch (format) {
    case "jpeg": bytes = await (await import("@jsquash/jpeg")).encode(img, { quality: q }); break;
    case "webp": bytes = await (await import("@jsquash/webp")).encode(img, { quality: q }); break;
    case "avif": bytes = await (await import("@jsquash/avif")).encode(img, { quality: q }); break;
    case "png": bytes = await (await import("@jsquash/png")).encode(img); break;
  }
  return new Blob([bytes], { type: MIME[format] });
}
