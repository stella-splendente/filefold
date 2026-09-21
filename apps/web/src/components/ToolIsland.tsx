import { useMemo } from "preact/hooks";
import { createCore } from "@filekit/core";
import { LicenseClient, Quota, type BenefitMap, type KVStore } from "@filekit/license";
import { ToolShell, toolById, type Locale } from "@filekit/ui";

function localStore(): KVStore {
  return {
    get: async (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: async (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    remove: async (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };
}

interface Props {
  locale: Locale;
  toolId: string;
  orgId: string;
  benefits: string;
  checkoutUrl?: string;
}

export default function ToolIsland({ locale, toolId, orgId, benefits, checkoutUrl }: Props) {
  const tool = toolById(toolId);
  const rt = useMemo(() => {
    const store = localStore();
    let map: BenefitMap = {};
    try { map = JSON.parse(benefits) as BenefitMap; } catch { /* keep empty */ }
    return { core: createCore(), license: new LicenseClient({ organizationId: orgId, benefits: map, store }), quota: new Quota(store) };
  }, [orgId, benefits]);
  if (!tool) return null;
  return <ToolShell locale={locale} tool={tool} core={rt.core} license={rt.license} quota={rt.quota} checkoutUrl={checkoutUrl} showHeader={false} />;
}
