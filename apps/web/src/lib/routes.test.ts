import { describe, it, expect } from "vitest";
import { TOOLS } from "@filekit/ui";
import { toolPath, toolRoutes } from "./routes";

describe("toolRoutes", () => {
  it("도구마다 en, ko 두 경로를 만든다", () => {
    const routes = toolRoutes();
    expect(routes).toHaveLength(TOOLS.length * 2);
    expect(new Set(routes.map((r) => r.slug)).size).toBe(routes.length);
  });

  it("ko 경로는 ko/ 로 시작하고 en 은 접두가 없다", () => {
    const routes = toolRoutes();
    for (const r of routes) {
      if (r.locale === "ko") expect(r.slug.startsWith("ko/")).toBe(true);
      else expect(r.slug.includes("/")).toBe(false);
    }
  });

  it("toolPath 는 후행 슬래시를 붙인다", () => {
    expect(toolPath("en", "merge-pdf")).toBe("/merge-pdf/");
    expect(toolPath("ko", "merge-pdf")).toBe("/ko/merge-pdf/");
  });
});
