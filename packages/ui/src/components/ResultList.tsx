import { useEffect, useMemo } from "preact/hooks";
import type { JobResult } from "@filekit/core";
import { t, type Locale } from "../i18n";

function human(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResultList({ locale, result }: { locale: Locale; result: JobResult }) {
  const url = useMemo(() => URL.createObjectURL(result.blob), [result.blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const before = typeof result.meta?.before === "number" ? (result.meta.before as number) : null;

  return (
    <div class="ff-result" role="status">
      <div>
        <strong class="ff-ok">{t(locale, "common.done")}</strong>
        <div class="ff-note">{result.filename} · {human(result.blob.size)}{before ? ` (← ${human(before)})` : ""}</div>
      </div>
      <a class="ff-btn" href={url} download={result.filename} data-testid="download">{t(locale, "common.download")}</a>
    </div>
  );
}
