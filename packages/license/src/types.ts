export type Suite = "pdf" | "image" | "audio";
export type Tier = "free" | "pro";

export interface KVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface LicenseState {
  tier: Tier;
  suites: Suite[];
  key?: string;
  activationId?: string;
  lastValidatedAt?: number;
  graceUntil?: number;
}

export type LicenseErrorCode = "INVALID_KEY" | "LIMIT_REACHED" | "NETWORK" | "INTERNAL";

export class LicenseError extends Error {
  constructor(
    public readonly code: LicenseErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "LicenseError";
  }
}

/** Polar benefit_id → 해당 키가 여는 스위트. 빌드 시 환경변수로 주입한다. */
export type BenefitMap = Record<string, Suite[]>;

export const FREE_STATE: LicenseState = { tier: "free", suites: [] };
