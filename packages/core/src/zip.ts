import { zipSync } from "fflate";
import type { JobResult } from "./types";

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

export function zipResults(items: ZipEntry[], zipName: string): JobResult {
  const input: Record<string, Uint8Array> = {};
  for (const item of items) input[item.name] = item.data;
  const bytes = zipSync(input, { level: 0 });
  return { blob: new Blob([bytes as BlobPart], { type: "application/zip" }), filename: zipName };
}
