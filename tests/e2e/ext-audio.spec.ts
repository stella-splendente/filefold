import { test, expect } from "@playwright/test";
import path from "node:path";
import { launchWithExtension, openTool, runAndDownload } from "./helpers/extension";
import { makeWav } from "../fixtures/make-wav";

const APP = path.resolve(__dirname, "../../apps/ext-audio");

test.describe("ext-audio", () => {
  test("convert-audio 는 wav 를 mp3 로 바꾼다 (ffmpeg.wasm 로드 포함)", async () => {
    test.setTimeout(180_000);
    const { context, extensionId } = await launchWithExtension(APP);
    const page = await openTool(context, extensionId, "convert-audio");

    const out = await runAndDownload(page, [{ name: "tone.wav", mimeType: "audio/wav", buffer: Buffer.from(makeWav(1)) }]);

    // MP3: ID3 태그("ID3") 또는 프레임 싱크(0xFF 0xFB/0xF3/0xF2)
    const head = out.subarray(0, 3).toString("latin1");
    expect(head === "ID3" || (out[0] === 0xff && (out[1] & 0xe0) === 0xe0)).toBe(true);
    expect(out.length).toBeGreaterThan(1000);
    await context.close();
  });
});
