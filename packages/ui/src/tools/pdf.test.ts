import { describe, it, expect } from "vitest";
import { TOOLS, toolsBySuite } from "./index";
import en from "../i18n/en.json";
import ko from "../i18n/ko.json";

const PDF_IDS = ["merge-pdf", "split-pdf", "compress-pdf", "images-to-pdf", "pdf-to-images", "rotate-pdf", "reorder-pdf-pages", "delete-pdf-pages"];

describe("TOOLS (pdf)", () => {
  it("id 가 유일하다", () => {
    const ids = TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("pdf 스위트에 8개 도구가 있다", () => {
    expect(toolsBySuite("pdf").map((t) => t.id).sort()).toEqual([...PDF_IDS].sort());
  });

  it("모든 도구가 en/ko 이름·설명·키워드를 가진다", () => {
    for (const tool of TOOLS) {
      for (const dict of [en, ko] as unknown as Record<string, Record<string, unknown>>[]) {
        expect(dict.tools, tool.id).toHaveProperty(tool.id);
        const entry = (dict.tools as Record<string, Record<string, string>>)[tool.id];
        expect(entry.name.length, `${tool.id} name`).toBeGreaterThan(0);
        expect(entry.description.length, `${tool.id} description`).toBeGreaterThan(0);
      }
      expect(tool.keywords.length, `${tool.id} keywords`).toBeGreaterThanOrEqual(3);
      expect(tool.accept.length, `${tool.id} accept`).toBeGreaterThan(0);
    }
  });

  it("옵션 기본값이 choices 안에 있다", () => {
    for (const tool of TOOLS) {
      for (const opt of tool.options) {
        if (opt.type === "select") expect(opt.choices?.map((c) => c.value)).toContain(String(opt.default));
      }
    }
  });
});
