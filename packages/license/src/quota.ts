import type { KVStore, Tier } from "./types";

export const FREE_LIMITS = { maxFiles: 1, maxFileBytes: 26_214_400, dailyOps: 10 } as const;
export const PRO_LIMITS = { maxFiles: Infinity, maxFileBytes: 2_147_483_648, dailyOps: Infinity } as const;

export type QuotaReason = "TOO_MANY_FILES" | "FILE_TOO_LARGE" | "DAILY_LIMIT";
export type QuotaCheck = { ok: true } | { ok: false; reason: QuotaReason };

function limitsFor(tier: Tier) {
  return tier === "pro" ? PRO_LIMITS : FREE_LIMITS;
}

export class Quota {
  constructor(
    private readonly store: KVStore,
    private readonly now: () => number = Date.now,
  ) {}

  async check(tier: Tier, files: { size: number }[]): Promise<QuotaCheck> {
    const limits = limitsFor(tier);
    if (files.length > limits.maxFiles) return { ok: false, reason: "TOO_MANY_FILES" };
    if (files.some((f) => f.size > limits.maxFileBytes)) return { ok: false, reason: "FILE_TOO_LARGE" };
    if ((await this.usedToday()) >= limits.dailyOps) return { ok: false, reason: "DAILY_LIMIT" };
    return { ok: true };
  }

  async record(): Promise<void> {
    await this.store.set(this.todayKey(), String((await this.usedToday()) + 1));
  }

  async remainingToday(tier: Tier): Promise<number> {
    const limit = limitsFor(tier).dailyOps;
    return limit === Infinity ? Infinity : Math.max(0, limit - (await this.usedToday()));
  }

  private async usedToday(): Promise<number> {
    return Number((await this.store.get(this.todayKey())) ?? 0);
  }

  private todayKey(): string {
    return `quota:${new Date(this.now()).toISOString().slice(0, 10)}`;
  }
}
