import { t, type Locale, type ToolDefinition } from "@filekit/ui";

export function toolTitle(locale: Locale, tool: ToolDefinition): string {
  return `${t(locale, `tools.${tool.id}.name`)} — ${t(locale, "brand")}`;
}

export function toolDescription(locale: Locale, tool: ToolDefinition): string {
  return `${t(locale, `tools.${tool.id}.description`)} ${t(locale, "tagline")}`;
}

export function toolJsonLd(locale: Locale, tool: ToolDefinition, url: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t(locale, `tools.${tool.id}.name`),
    description: toolDescription(locale, tool),
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: locale,
    keywords: tool.keywords.join(", "),
  };
}
