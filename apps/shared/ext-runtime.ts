import { createCore, type RemoteCore } from "@filekit/core";
import { LicenseClient, Quota, type BenefitMap, type KVStore, type Suite } from "@filekit/license";
import { detectLocale, type Locale } from "@filekit/ui";

/** chrome.storage.local 을 KVStore 로 감싼다 (Firefox 도 chrome 네임스페이스 제공). */
export function extensionStore(): KVStore {
  const area = chrome.storage.local;
  return {
    get: async (k) => ((await area.get(k))[k] as string | undefined) ?? null,
    set: async (k, v) => area.set({ [k]: v }),
    remove: async (k) => area.remove(k),
  };
}

export interface ExtRuntime {
  locale: Locale;
  core: RemoteCore;
  license: LicenseClient;
  quota: Quota;
  suite: Suite;
  checkoutUrl?: string;
  bundleUrl?: string;
  browserLabel: string;
}

function parseBenefits(raw: string | undefined): BenefitMap {
  try { return raw ? (JSON.parse(raw) as BenefitMap) : {}; } catch { return {}; }
}

export function createExtRuntime(suite: Suite, env: Record<string, string | undefined>): ExtRuntime {
  const store = extensionStore();
  const browserLabel = env.VITE_BROWSER ?? "chrome";
  return {
    locale: detectLocale(),
    core: createCore(),
    license: new LicenseClient({ organizationId: env.VITE_POLAR_ORG_ID ?? "", benefits: parseBenefits(env.VITE_POLAR_BENEFITS), store }),
    quota: new Quota(store),
    suite,
    checkoutUrl: env[`VITE_POLAR_CHECKOUT_${suite.toUpperCase()}`],
    bundleUrl: env.VITE_POLAR_CHECKOUT_BUNDLE,
    browserLabel,
  };
}
