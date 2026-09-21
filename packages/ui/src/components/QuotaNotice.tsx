import type { QuotaReason } from "@filekit/license";
import { t, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  reason: QuotaReason | null;
  remaining: number;
  tier: "free" | "pro";
  checkoutUrl?: string;
}

export function QuotaNotice({ locale, reason, remaining, tier, checkoutUrl }: Props) {
  if (tier === "pro" && !reason) return <p class="ff-note">{t(locale, "quota.unlimited")}</p>;
  return (
    <div class="ff-quota" role={reason ? "alert" : undefined} data-testid="quota">
      <span class={reason ? "ff-error" : "ff-note"}>
        {reason ? t(locale, `quota.${reason}`) : t(locale, "quota.dailyLimit", { n: remaining })}
      </span>
      {checkoutUrl && <a class="ff-btn ff-btn--ghost" href={checkoutUrl} target="_blank" rel="noopener">{t(locale, "quota.upgrade")}</a>}
    </div>
  );
}
