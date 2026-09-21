import { heicToPngOnMainThread, isHeic } from "@filekit/core";
import type { ToolDefinition, ToolOption } from "./types";

const IMAGES = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/heic", "image/heif", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".heic", ".heif"];

const quality: ToolOption = { key: "quality", type: "range", labelKey: "options.quality", default: 0.8, min: 0.3, max: 1, step: 0.05 };
const format: ToolOption = {
  key: "to", type: "select", labelKey: "options.format", default: "webp",
  choices: [{ value: "jpeg", label: "JPG" }, { value: "png", label: "PNG" }, { value: "webp", label: "WebP" }, { value: "avif", label: "AVIF" }],
};

type Fmt = "jpeg" | "png" | "webp" | "avif";
const asFmt = (v: unknown): Fmt => (["jpeg", "png", "webp", "avif"].includes(String(v)) ? (String(v) as Fmt) : "webp");

export const IMAGE_TOOLS: ToolDefinition[] = [
  {
    id: "convert-image", suite: "image", accept: IMAGES, multiple: true, browserOnly: true, options: [format, quality],
    keywords: ["convert image", "image converter", "png to webp", "jpg to png", "webp to jpg"],
    run: (files, o, onProgress, core) => runEach(files, onProgress, (f) => core.convertImage(f, { to: asFmt(o.to), quality: Number(o.quality) })),
  },
  {
    id: "heic-to-jpg", suite: "image", accept: ["image/heic", "image/heif", ".heic", ".heif"], multiple: true, browserOnly: true,
    options: [format, quality], preset: { to: "jpeg" },
    keywords: ["heic to jpg", "convert heic", "iphone photo to jpg", "heic converter"],
    run: (files, o, onProgress, core) => runEach(files, onProgress, (f) => core.convertImage(f, { to: "jpeg", quality: Number(o.quality) })),
  },
  {
    id: "compress-image", suite: "image", accept: IMAGES, multiple: true, browserOnly: true, options: [{ ...quality, default: 0.7 }],
    keywords: ["compress image", "reduce image size", "image compressor", "shrink photo"],
    run: (files, o, onProgress, core) => runEach(files, onProgress, (f) => core.compressImage(f, { quality: Number(o.quality) })),
  },
  {
    id: "resize-image", suite: "image", accept: IMAGES, multiple: true, browserOnly: true,
    options: [
      { key: "width", type: "number", labelKey: "options.width", default: 1200, min: 1, max: 10000 },
      { key: "height", type: "number", labelKey: "options.height", default: 0, min: 0, max: 10000 },
      { key: "fit", type: "select", labelKey: "options.fit", default: "contain", choices: [{ value: "contain", labelKey: "options.fitContain" }, { value: "cover", labelKey: "options.fitCover" }] },
    ],
    keywords: ["resize image", "image resizer", "scale photo", "change image dimensions"],
    run: (files, o, onProgress, core) => runEach(files, onProgress, (f) =>
      core.resizeImage(f, { width: Number(o.width) || undefined, height: Number(o.height) || undefined, fit: o.fit === "cover" ? "cover" : "contain" })),
  },
];

/** HEIC 는 워커가 못 읽으므로(document 필요) 메인 스레드에서 PNG 로 먼저 바꾼다. 이름은 유지. */
async function prepare(f: File): Promise<File> {
  if (!isHeic(f)) return f;
  const png = await heicToPngOnMainThread(f);
  const stem = f.name.replace(/\.[^.]+$/, "") || "image";
  return new File([png], `${stem}.png`, { type: "image/png" });
}

/** 여러 파일이면 각각 처리해 zip 으로, 하나면 그대로. */
async function runEach(
  files: File[],
  onProgress: Parameters<ToolDefinition["run"]>[2],
  one: (f: File) => Promise<{ blob: Blob; filename: string; meta?: Record<string, unknown> }>,
) {
  if (files.length === 1) return one(await prepare(files[0]));
  const { zipResults } = await import("@filekit/core");
  const entries = [];
  for (const [i, f] of files.entries()) {
    const r = await one(await prepare(f));
    entries.push({ name: r.filename, data: new Uint8Array(await r.blob.arrayBuffer()) });
    onProgress({ done: i + 1, total: files.length });
  }
  return zipResults(entries, "images.zip");
}
