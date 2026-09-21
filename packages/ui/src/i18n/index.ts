import en from "./en.json";
import ko from "./ko.json";

export type Locale = "en" | "ko";
type Dict = Record<string, unknown>;

const DICTS: Record<Locale, Dict> = { en, ko };

export function flattenKeys(obj: Dict, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flattenKeys(v as Dict, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

function lookup(dict: Dict, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Dict)[part] : undefined), dict);
  return typeof value === "string" ? value : undefined;
}

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const raw = lookup(DICTS[locale], key) ?? lookup(DICTS.en, key) ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}

export function detectLocale(navigatorLanguage: string | undefined = globalThis.navigator?.language): Locale {
  return navigatorLanguage?.toLowerCase().startsWith("ko") ? "ko" : "en";
}
