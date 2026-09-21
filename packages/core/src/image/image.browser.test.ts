import { describe, it, expect } from "vitest";
import { pngBlob } from "../../../../tests/fixtures/make-png";
import { compressImage, convertImage, resizeImage } from "./index";

async function dims(blob: Blob): Promise<{ w: number; h: number }> {
  const bmp = await createImageBitmap(blob);
  return { w: bmp.width, h: bmp.height };
}

describe("image (browser)", () => {
  it("png → webp 변환", async () => {
    const result = await convertImage(pngBlob(), { to: "webp", quality: 0.8 });

    expect(result.blob.type).toBe("image/webp");
    expect(result.filename).toBe("image.webp");
    expect(await dims(result.blob)).toEqual({ w: 1, h: 1 });
  });

  it("png → jpeg, avif 변환", async () => {
    expect((await convertImage(pngBlob(), { to: "jpeg", quality: 0.8 })).blob.type).toBe("image/jpeg");
    expect((await convertImage(pngBlob(), { to: "avif", quality: 0.6 })).blob.type).toBe("image/avif");
  });

  it("compressImage 는 원본 포맷을 유지한다", async () => {
    const result = await compressImage(pngBlob(), { quality: 0.5 });

    expect(result.blob.type).toBe("image/png");
    expect(result.meta).toMatchObject({ before: pngBlob().size });
  });

  it("resizeImage contain 은 비율을 유지한다", async () => {
    const canvas = new OffscreenCanvas(100, 50);
    canvas.getContext("2d")!.fillRect(0, 0, 100, 50);
    const src = await canvas.convertToBlob({ type: "image/png" });

    const result = await resizeImage(src, { width: 50, fit: "contain" });

    expect(await dims(result.blob)).toEqual({ w: 50, h: 25 });
  });

  it("손상된 입력은 CORRUPT_FILE", async () => {
    await expect(convertImage(new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }), { to: "webp", quality: 0.8 })).rejects.toMatchObject({ code: "CORRUPT_FILE" });
  });
});
