import { useMemo } from "preact/hooks";
import { LicenseClient, type BenefitMap, type KVStore } from "@filekit/license";
import { LicensePanel, type Locale } from "@filekit/ui";

function localStore(): KVStore {
  return {
    get: async (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: async (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
    remove: async (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };
}

export default function LicenseIsland({ locale, orgId, benefits, checkoutUrl, bundleUrl }: { locale: Locale; orgId: string; benefits: string; checkoutUrl?: string; bundleUrl?: string }) {
  const client = useMemo(() => {
    let map: BenefitMap = {};
    try { map = JSON.parse(benefits) as BenefitMap; } catch { /* keep empty */ }
    return new LicenseClient({ organizationId: orgId, benefits: map, store: localStore() });
  }, [orgId, benefits]);
  return <LicensePanel locale={locale} client={client} label="web" checkoutUrl={checkoutUrl} bundleUrl={bundleUrl} />;
}
