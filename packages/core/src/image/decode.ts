import { CoreError } from "../types";

export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export function isHeic(file: Blob & { name?: string }): boolean {
  if (HEIC_TYPES.has(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name ?? "");
}

/** 무엇이든 ImageData 로. HEIC 는 heic-to, 나머지는 브라우저 디코더. */
export async function decodeImage(file: Blob & { name?: string }): Promise<ImageData> {
  if (isHeic(file)) {
    throw new CoreError("UNSUPPORTED_FORMAT", "HEIC 는 메인 스레드에서 먼저 PNG 로 변환해야 합니다 (heicToPngOnMainThread)");
  }
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String((err as { message?: string } | null)?.message ?? err ?? "unknown");
    throw new CoreError("CORRUPT_FILE", `이미지를 읽을 수 없습니다: ${detail}`);
  }
}

/** 파일 시그니처로 원본 포맷 추정 (compress 가 포맷을 유지할 때 사용). */
export async function sniffFormat(file: Blob & { name?: string }): Promise<ImageFormat> {
  if (isHeic(file)) return "jpeg";
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head[0] === 0x89 && head[1] === 0x50) return "png";
  if (head[0] === 0xff && head[1] === 0xd8) return "jpeg";
  if (head[0] === 0x52 && head[1] === 0x49 && head[8] === 0x57 && head[9] === 0x45) return "webp";
  if (head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70) return "avif";
  throw new CoreError("UNSUPPORTED_FORMAT", "지원하지 않는 이미지 형식입니다");
}
