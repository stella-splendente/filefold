import { describe, it, expect } from "vitest";
import { api } from "./api";
import * as pdf from "../pdf";

describe("worker api", () => {
  it("pdf 모듈의 모든 함수를 노출한다", () => {
    const fns = Object.entries(pdf).filter(([, v]) => typeof v === "function").map(([k]) => k);
    for (const name of fns) expect(api, name).toHaveProperty(name);
  });
});
