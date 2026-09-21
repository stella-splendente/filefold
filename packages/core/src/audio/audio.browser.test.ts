import { describe, it, expect } from "vitest";
import { wavBlob } from "../../../../tests/fixtures/make-wav";
import { compressAudio, convertAudio, trimAudio } from "./index";

async function duration(blob: Blob): Promise<number> {
  const ctx = new AudioContext();
  const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
  await ctx.close();
  return buf.duration;
}

describe("audio (browser, ffmpeg.wasm)", () => {
  it("wav → mp3 변환", async () => {
    const result = await convertAudio(wavBlob(1), { to: "mp3", bitrateKbps: 64 });

    expect(result.blob.type).toBe("audio/mpeg");
    expect(result.filename).toBe("audio.mp3");
    expect(result.blob.size).toBeGreaterThan(1000);
  }, 120_000);

  it("wav → m4a(aac) 변환 후 길이가 약 1초", async () => {
    const result = await convertAudio(wavBlob(1), { to: "m4a", bitrateKbps: 64 });

    expect(result.blob.type).toBe("audio/mp4");
    expect(await duration(result.blob)).toBeCloseTo(1, 0);
  }, 120_000);

  it("wav → ogg 변환 (코어에 vorbis 인코더가 있으면 통과, 없으면 UNSUPPORTED_FORMAT)", async () => {
    try {
      const result = await convertAudio(wavBlob(1), { to: "ogg", bitrateKbps: 64 });
      expect(result.blob.type).toBe("audio/ogg");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("UNSUPPORTED_FORMAT");
    }
  }, 120_000);

  it("trimAudio 0.2~0.7초 → 약 0.5초", async () => {
    const result = await trimAudio(wavBlob(1), { startSec: 0.2, endSec: 0.7 });

    expect(result.blob.type).toBe("audio/wav");
    expect(await duration(result.blob)).toBeCloseTo(0.5, 1);
  }, 120_000);

  it("compressAudio 는 mp3 로 낮은 비트레이트 출력", async () => {
    const result = await compressAudio(wavBlob(1), { bitrateKbps: 32 });

    expect(result.blob.type).toBe("audio/mpeg");
    expect(result.meta).toMatchObject({ before: wavBlob(1).size });
  }, 120_000);

  it("손상된 입력은 CORRUPT_FILE", async () => {
    await expect(convertAudio(new Blob([new Uint8Array([1, 2, 3])], { type: "audio/wav" }), { to: "mp3", bitrateKbps: 64 })).rejects.toMatchObject({ code: "CORRUPT_FILE" });
  }, 120_000);
});
