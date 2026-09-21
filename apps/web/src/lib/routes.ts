import { TOOLS, type Locale, type ToolDefinition } from "@filekit/ui";

export interface ToolRoute {
  slug: string;        // "merge-pdf" 또는 "ko/merge-pdf"
  locale: Locale;
  tool: ToolDefinition;
}

export const LOCALES: Locale[] = ["en", "ko"];

export function toolPath(locale: Locale, toolId: string): string {
  return locale === "en" ? `/${toolId}/` : `/${locale}/${toolId}/`;
}

export function toolRoutes(): ToolRoute[] {
  return LOCALES.flatMap((locale) =>
    TOOLS.map((tool) => ({ slug: locale === "en" ? tool.id : `${locale}/${tool.id}`, locale, tool })),
  );
}

export function homePath(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}/`;
}
