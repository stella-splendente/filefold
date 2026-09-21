import type { JobProgress } from "@filekit/core";
import { t, type Locale } from "../i18n";

export function Progress({ locale, progress }: { locale: Locale; progress: JobProgress | null }) {
  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <div>
      <div class="ff-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t(locale, "common.running")}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <p class="ff-note" aria-live="polite">{t(locale, "common.running")} {pct}%{progress?.message ? ` · ${progress.message}` : ""}</p>
    </div>
  );
}
