import { t, type Locale } from "../i18n";
import type { ToolDefinition } from "../tools";

interface Props {
  locale: Locale;
  tools: ToolDefinition[];
  currentId?: string;
  href(tool: ToolDefinition): string;
  onSelect?(tool: ToolDefinition): void;
}

export function ToolList({ locale, tools, currentId, href, onSelect }: Props) {
  return (
    <ul class="ff-list" aria-label={t(locale, "common.otherTools")}>
      {tools.map((tool) => (
        <li key={tool.id}>
          <a class="ff-card" href={href(tool)} aria-current={tool.id === currentId ? "true" : undefined}
             onClick={onSelect ? (e) => { e.preventDefault(); onSelect(tool); } : undefined} data-testid={`tool-link-${tool.id}`}>
            <h3>{t(locale, `tools.${tool.id}.name`)}</h3>
            <p>{t(locale, `tools.${tool.id}.description`)}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}
