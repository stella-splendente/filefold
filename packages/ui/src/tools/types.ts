import type { CoreApi, JobResult, OnProgress } from "@filekit/core";
import type { Suite } from "@filekit/license";

export type OptionValue = string | number;

export interface ToolOption {
  key: string;
  type: "select" | "number" | "range" | "text";
  labelKey: string;              // i18n 키 (options.*)
  default: OptionValue;
  choices?: { value: string; labelKey?: string; label?: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ToolDefinition {
  id: string;                    // URL slug 이자 i18n 키 (tools.<id>)
  suite: Suite;
  accept: string[];              // MIME 또는 ".ext"
  multiple: boolean;
  options: ToolOption[];
  keywords: string[];            // 영어 SEO/스토어 키워드
  preset?: Record<string, OptionValue>;   // SEO 전용 slug 가 다른 도구의 고정 옵션일 때
  browserOnly?: boolean;         // OffscreenCanvas/wasm 필요 (node 테스트 제외 표시)
  run(files: File[], opts: Record<string, OptionValue>, onProgress: OnProgress, core: CoreApi): Promise<JobResult>;
}

/** "1,3-5" → [1,3,4,5] */
export function parsePageList(text: string): number[] {
  const out = new Set<number>();
  for (const part of text.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`잘못된 페이지 표기: ${part}`);
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    if (to < from) throw new Error(`잘못된 범위: ${part}`);
    for (let i = from; i <= to; i++) out.add(i);
  }
  return [...out].sort((a, b) => a - b);
}

/** "1-2,3-5" → [{from:1,to:2},{from:3,to:5}] */
export function parseRanges(text: string): { from: number; to: number }[] {
  return text.split(",").map((s) => s.trim()).filter(Boolean).map((part) => {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`잘못된 범위 표기: ${part}`);
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    if (to < from) throw new Error(`잘못된 범위: ${part}`);
    return { from, to };
  });
}

export function baseName(file: File): string {
  return file.name.replace(/\.[^.]+$/, "") || "file";
}
