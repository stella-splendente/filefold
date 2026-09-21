const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export function isHeic(file: Blob & { name?: string }): boolean {
  if (HEIC_TYPES.has(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name ?? "");
}

/**
 * HEIC → PNG. heic-to 는 document 를 쓰므로 워커가 아닌 메인 스레드에서만 호출한다.
 * 앱은 `@filekit/core/heic` 서브패스로만 import 해서 다른 스위트 번들에 heic-to 가 섞이지 않게 한다.
 */
export async function heicToPngOnMainThread(file: Blob): Promise<Blob> {
  const { heicTo } = await import("heic-to/csp");
  return heicTo({ blob: file, type: "image/png", quality: 1 });
}
