import { activateKey, validateKey } from "./polar";
import { FREE_STATE, LicenseError, type BenefitMap, type KVStore, type LicenseState } from "./types";

export type { KVStore, LicenseState } from "./types";

const DAY = 86_400_000;
const STATE_KEY = "license:state";

export interface LicenseClientOptions {
  organizationId: string;
  benefits: BenefitMap;
  store: KVStore;
  fetch?: typeof fetch;
  now?: () => number;
  revalidateMs?: number;
  graceMs?: number;
}

export class LicenseClient {
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly revalidateMs: number;
  private readonly graceMs: number;

  constructor(private readonly opts: LicenseClientOptions) {
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
    this.now = opts.now ?? Date.now;
    this.revalidateMs = opts.revalidateMs ?? 7 * DAY;
    this.graceMs = opts.graceMs ?? 30 * DAY;
  }

  async activate(key: string, label: string): Promise<LicenseState> {
    const res = await activateKey(this.fetchImpl, this.opts.organizationId, key.trim(), label);
    const suites = this.opts.benefits[res.license_key.benefit_id];
    if (!suites) throw new LicenseError("INVALID_KEY", "이 제품의 키가 아닙니다");
    const state: LicenseState = { tier: "pro", suites, key: key.trim(), activationId: res.id, lastValidatedAt: this.now() };
    await this.save(state);
    return state;
  }

  async getState(): Promise<LicenseState> {
    const state = await this.load();
    if (state.tier !== "pro" || !state.key) return state;
    const age = this.now() - (state.lastValidatedAt ?? 0);
    if (age < this.revalidateMs) return state;
    return this.revalidate(state);
  }

  async deactivate(): Promise<void> {
    await this.opts.store.remove(STATE_KEY);
  }

  private async revalidate(state: LicenseState): Promise<LicenseState> {
    try {
      const res = await validateKey(this.fetchImpl, this.opts.organizationId, state.key!, state.activationId);
      const suites = this.opts.benefits[res.benefit_id] ?? state.suites;
      const fresh: LicenseState = { ...state, suites, lastValidatedAt: this.now(), graceUntil: undefined };
      await this.save(fresh);
      return fresh;
    } catch (err) {
      const code = (err as LicenseError).code;
      if (code === "NETWORK") return this.applyGrace(state);
      await this.save(FREE_STATE);
      return FREE_STATE;
    }
  }

  private async applyGrace(state: LicenseState): Promise<LicenseState> {
    const graceUntil = state.graceUntil ?? (state.lastValidatedAt ?? 0) + this.graceMs;
    if (this.now() > graceUntil) {
      await this.save(FREE_STATE);
      return FREE_STATE;
    }
    const graced = { ...state, graceUntil };
    await this.save(graced);
    return graced;
  }

  private async load(): Promise<LicenseState> {
    const raw = await this.opts.store.get(STATE_KEY);
    if (!raw) return FREE_STATE;
    try {
      return JSON.parse(raw) as LicenseState;
    } catch {
      return FREE_STATE;
    }
  }

  private save(state: LicenseState): Promise<void> {
    return this.opts.store.set(STATE_KEY, JSON.stringify(state));
  }
}
