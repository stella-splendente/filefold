import { useEffect, useState } from "preact/hooks";
import type { LicenseClient, LicenseState } from "@filekit/license";
import { t, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  client: LicenseClient;
  label: string; // 활성화 기기 표시명 (chrome/edge/firefox/web)
  checkoutUrl?: string;
  bundleUrl?: string;
}

export function LicensePanel({ locale, client, label, checkoutUrl, bundleUrl }: Props) {
  const [state, setState] = useState<LicenseState | null>(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { client.getState().then(setState); }, [client]);

  const activate = async (e: Event) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      setState(await client.activate(key, label));
      setKey("");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "INTERNAL";
      setError(t(locale, `license.${code}`));
    } finally { setBusy(false); }
  };

  const deactivate = async () => { await client.deactivate(); setState(await client.getState()); };

  return (
    <section class="ff-license" aria-labelledby="ff-license-title" data-testid="license">
      <h2 id="ff-license-title">{t(locale, "license.title")}</h2>
      {state?.tier === "pro" ? (
        <>
          <p class="ff-ok">{t(locale, "license.active", { suites: state.suites.join(", ") })}</p>
          {state.graceUntil && <p class="ff-note">{t(locale, "license.grace", { date: new Date(state.graceUntil).toLocaleDateString(locale) })}</p>}
          <button type="button" class="ff-btn ff-btn--ghost" onClick={deactivate}>{t(locale, "license.deactivate")}</button>
        </>
      ) : (
        <>
          <p class="ff-note">{t(locale, "license.inactive")}</p>
          <form onSubmit={activate}>
            <input value={key} onInput={(e) => setKey((e.target as HTMLInputElement).value)} placeholder={t(locale, "license.placeholder")} aria-label={t(locale, "license.placeholder")} required />
            <button type="submit" class="ff-btn" disabled={busy || !key.trim()}>{t(locale, "license.activate")}</button>
          </form>
          {error && <p class="ff-error" role="alert">{error}</p>}
          <p>
            {checkoutUrl && <a class="ff-btn" href={checkoutUrl} target="_blank" rel="noopener">{t(locale, "quota.upgrade")}</a>}{" "}
            {bundleUrl && <a class="ff-btn ff-btn--ghost" href={bundleUrl} target="_blank" rel="noopener">{t(locale, "quota.upgradeBundle")}</a>}
          </p>
        </>
      )}
    </section>
  );
}
