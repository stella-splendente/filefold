import { describe, it, expect } from "vitest";
import { t, flattenKeys } from "./index";
import en from "./en.json";
import ko from "./ko.json";

describe("i18n", () => {
  it("en 과 ko 의 키 집합이 같다", () => {
    expect(flattenKeys(ko).sort()).toEqual(flattenKeys(en).sort());
  });

  it("점 표기 키로 번역을 찾고 변수 치환을 한다", () => {
    expect(t("en", "quota.dailyLimit", { n: 10 })).toContain("10");
    expect(t("ko", "quota.dailyLimit", { n: 10 })).toContain("10");
  });

  it("없는 키는 키 자체를 돌려준다", () => {
    expect(t("en", "nope.missing")).toBe("nope.missing");
  });
});
