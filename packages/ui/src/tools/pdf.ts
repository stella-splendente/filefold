import type { ToolDefinition, ToolOption } from "./types";
import { baseName, parsePageList, parseRanges } from "./types";

const PDF = ["application/pdf", ".pdf"];
const IMAGES = ["image/png", "image/jpeg", ".png", ".jpg", ".jpeg"];

const quality: ToolOption = { key: "quality", type: "range", labelKey: "options.quality", default: 0.7, min: 0.3, max: 0.95, step: 0.05 };
const dpi: ToolOption = { key: "dpi", type: "select", labelKey: "options.dpi", default: "110", choices: [{ value: "72", label: "72" }, { value: "110", label: "110" }, { value: "150", label: "150" }, { value: "200", label: "200" }] };

export const PDF_TOOLS: ToolDefinition[] = [
  {
    id: "merge-pdf", suite: "pdf", accept: PDF, multiple: true, options: [],
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger"],
    run: (files, _o, onProgress, core) => core.mergePdfs(files, onProgress),
  },
  {
    id: "split-pdf", suite: "pdf", accept: PDF, multiple: false,
    options: [{ key: "ranges", type: "text", labelKey: "options.ranges", default: "1-1", placeholder: "1-2,3-5" }],
    keywords: ["split pdf", "extract pdf pages", "pdf splitter", "separate pdf pages"],
    run: (files, o, onProgress, core) => core.splitPdf(files[0], parseRanges(String(o.ranges)), baseName(files[0]), onProgress),
  },
  {
    id: "compress-pdf", suite: "pdf", accept: PDF, multiple: false, browserOnly: true, options: [quality, dpi],
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor"],
    run: (files, o, onProgress, core) => core.compressPdf(files[0], { quality: Number(o.quality), dpi: Number(o.dpi) }, onProgress),
  },
  {
    id: "images-to-pdf", suite: "pdf", accept: IMAGES, multiple: true,
    options: [{ key: "pageSize", type: "select", labelKey: "options.pageSize", default: "fit", choices: [{ value: "fit", labelKey: "options.pageSizeFit" }, { value: "a4", labelKey: "options.pageSizeA4" }] }],
    keywords: ["jpg to pdf", "png to pdf", "images to pdf", "convert image to pdf"],
    run: (files, o, _p, core) => core.imagesToPdf(files, { pageSize: o.pageSize === "a4" ? "a4" : "fit" }),
  },
  {
    id: "pdf-to-images", suite: "pdf", accept: PDF, multiple: false, browserOnly: true,
    options: [{ key: "format", type: "select", labelKey: "options.format", default: "png", choices: [{ value: "png", label: "PNG" }, { value: "jpeg", label: "JPG" }] }, dpi],
    keywords: ["pdf to jpg", "pdf to png", "convert pdf to image", "pdf pages to images"],
    run: (files, o, onProgress, core) => core.pdfToImages(files[0], { format: o.format === "jpeg" ? "jpeg" : "png", dpi: Number(o.dpi) }, onProgress),
  },
  {
    id: "rotate-pdf", suite: "pdf", accept: PDF, multiple: false,
    options: [
      { key: "degrees", type: "select", labelKey: "options.degrees", default: "90", choices: [{ value: "90", label: "90°" }, { value: "180", label: "180°" }, { value: "270", label: "270°" }] },
      { key: "pages", type: "text", labelKey: "options.pages", default: "", placeholder: "all" },
    ],
    keywords: ["rotate pdf", "rotate pdf pages", "turn pdf", "pdf rotation"],
    run: (files, o, _p, core) => core.rotatePdf(files[0], Number(o.degrees) as 90 | 180 | 270, String(o.pages).trim() ? parsePageList(String(o.pages)) : undefined),
  },
  {
    id: "reorder-pdf-pages", suite: "pdf", accept: PDF, multiple: false,
    options: [{ key: "order", type: "text", labelKey: "options.order", default: "", placeholder: "3,1,2" }],
    keywords: ["reorder pdf pages", "rearrange pdf", "move pdf pages", "sort pdf pages"],
    run: (files, o, _p, core) => core.reorderPages(files[0], String(o.order).split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))),
  },
  {
    id: "delete-pdf-pages", suite: "pdf", accept: PDF, multiple: false,
    options: [{ key: "pages", type: "text", labelKey: "options.pages", default: "", placeholder: "2,4-5" }],
    keywords: ["delete pdf pages", "remove pdf pages", "pdf page remover", "cut pages from pdf"],
    run: (files, o, _p, core) => core.deletePages(files[0], parsePageList(String(o.pages))),
  },
];
