import { describe, it, expect } from "vitest";
import { FREE_LIMITS, Quota } from "./quota";
import type { KVStore } from "./client";

function memoryStore(): KVStore {
  const m = new Map<string, string>();
  return { get: async (k) => m.get(k) ?? null, set: async (k, v) => void m.set(k, v), remove: async (k) => void m.delete(k) };
}

const DAY = 86_400_000;

describe("Quota", () => {
  it("free 는 파일 2개면 TOO_MANY_FILES", async () => {
    const q = new Quota(memoryStore(), () => 0);

    expect(await q.check("free", [{ size: 1 }, { size: 1 }])).toEqual({ ok: false, reason: "TOO_MANY_FILES" });
  });

  it("free 는 25MB 초과면 FILE_TOO_LARGE", async () => {
    const q = new Quota(memoryStore(), () => 0);

    expect(await q.check("free", [{ size: FREE_LIMITS.maxFileBytes + 1 }])).toEqual({ ok: false, reason: "FILE_TOO_LARGE" });
    expect(await q.check("free", [{ size: FREE_LIMITS.maxFileBytes }])).toEqual({ ok: true });
  });

  it("free 는 하루 10회 이후 DAILY_LIMIT, 날짜가 바뀌면 리셋", async () => {
    const now = { t: 0 };
    const q = new Quota(memoryStore(), () => now.t);
    for (let i = 0; i < FREE_LIMITS.dailyOps; i++) await q.record();

    expect(await q.check("free", [{ size: 1 }])).toEqual({ ok: false, reason: "DAILY_LIMIT" });
    now.t = DAY;
    expect(await q.check("free", [{ size: 1 }])).toEqual({ ok: true });
  });

  it("pro 는 파일 수·횟수 제한이 없고 2GB 까지 허용", async () => {
    const q = new Quota(memoryStore(), () => 0);
    for (let i = 0; i < 50; i++) await q.record();

    expect(await q.check("pro", Array.from({ length: 20 }, () => ({ size: 2_147_483_648 })))).toEqual({ ok: true });
    expect(await q.check("pro", [{ size: 2_147_483_649 }])).toEqual({ ok: false, reason: "FILE_TOO_LARGE" });
  });

  it("남은 횟수를 알려준다", async () => {
    const q = new Quota(memoryStore(), () => 0);
    await q.record();

    expect(await q.remainingToday("free")).toBe(FREE_LIMITS.dailyOps - 1);
    expect(await q.remainingToday("pro")).toBe(Infinity);
  });
});
