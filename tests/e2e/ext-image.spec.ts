import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { launchWithExtension, openTool, runAndDownload } from "./helpers/extension";

const APP = path.resolve(__dirname, "../../apps/ext-image");
const HEIC = fs.readFileSync(path.resolve(__dirname, "../fixtures/sample.heic"));
const PNG = fs.readFileSync(path.resolve(__dirname, "../fixtures/sample.png"));

test.describe("ext-image", () => {
  test("heic-to-jpg 는 HEIC 를 JPEG 로 바꾼다", async () => {
    const { context, extensionId } = await launchWithExtension(APP);
    const page = await openTool(context, extensionId, "heic-to-jpg");

    const out = await runAndDownload(page, [{ name: "photo.heic", mimeType: "image/heic", buffer: HEIC }]);

    expect(out[0]).toBe(0xff);
    expect(out[1]).toBe(0xd8);
    await context.close();
  });

  test("convert-image 로 png → webp, 두 파일이면 zip", async () => {
    const { context, extensionId } = await launchWithExtension(APP);
    const page = await openTool(context, extensionId, "convert-image");

    const out = await runAndDownload(page, [
      { name: "a.png", mimeType: "image/png", buffer: PNG },
      { name: "b.png", mimeType: "image/png", buffer: PNG },
    ]);

    expect(out.subarray(0, 2).toString("hex")).toBe("504b");
    await context.close();
  });
});
