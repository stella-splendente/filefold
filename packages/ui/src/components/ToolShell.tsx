import { useEffect, useRef, useState } from "preact/hooks";
import type { JobProgress, JobResult, RemoteCore, CoreApi } from "@filekit/core";
import { progressProxy } from "@filekit/core";
import type { LicenseClient, Quota, QuotaReason } from "@filekit/license";
import { t, type Locale } from "../i18n";
import type { OptionValue, ToolDefinition } from "../tools";
import { DropZone } from "./DropZone";
import { Progress } from "./Progress";
import { QuotaNotice } from "./QuotaNotice";
import { ResultList } from "./ResultList";

export interface ToolShellProps {
  locale: Locale;
  tool: ToolDefinition;
  core: RemoteCore;
  license: LicenseClient;
  quota: Quota;
  checkoutUrl?: string;
  showHeader?: boolean;
}

type Phase = { kind: "idle" } | { kind: "running"; progress: JobProgress | null } | { kind: "done"; result: JobResult } | { kind: "error"; message: string };

function defaults(tool: ToolDefinition): Record<string, OptionValue> {
  const out: Record<string, OptionValue> = {};
  for (const o of tool.options) out[o.key] = o.default;
  return { ...out, ...tool.preset };
}

export function ToolShell({ locale, tool, core, license, quota, checkoutUrl, showHeader = true }: ToolShellProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [opts, setOpts] = useState(defaults(tool));
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [remaining, setRemaining] = useState(0);
  const [quotaReason, setQuotaReason] = useState<QuotaReason | null>(null);
  /** 워커 진행률 콜백은 결과보다 늦게 도착할 수 있어(별도 MessageChannel) 실행 중일 때만 반영한다. */
  const active = useRef(false);

  const refreshQuota = async () => {
    const state = await license.getState();
    const nextTier = state.tier === "pro" && state.suites.includes(tool.suite) ? "pro" : "free";
    setTier(nextTier);
    setRemaining(await quota.remainingToday(nextTier));
  };

  useEffect(() => { setFiles([]); setOpts(defaults(tool)); setPhase({ kind: "idle" }); setQuotaReason(null); refreshQuota(); }, [tool.id]);

  const run = async () => {
    const check = await quota.check(tier, files);
    if (!check.ok) { setQuotaReason(check.reason); return; }
    setQuotaReason(null);
    setPhase({ kind: "running", progress: null });
    active.current = true;
    try {
      const onProgress = progressProxy((p) => { if (active.current) setPhase({ kind: "running", progress: p }); });
      const result = await tool.run(files, opts, onProgress, core as unknown as CoreApi);
      active.current = false;
      await quota.record();
      setPhase({ kind: "done", result });
      await refreshQuota();
    } catch (err) {
      active.current = false;
      const code = (err as { code?: string }).code;
      const message = code ? t(locale, `errors.${code}`, { message: (err as Error).message }) : (err as Error).message;
      setPhase({ kind: "error", message });
    }
  };

  const visibleOptions = tool.options.filter((o) => !(tool.preset && o.key in tool.preset));

  return (
    <div class="ff-shell" data-testid={`tool-${tool.id}`}>
      {showHeader && (
        <header>
          <h1>{t(locale, `tools.${tool.id}.name`)}</h1>
          <p class="ff-note">{t(locale, `tools.${tool.id}.description`)}</p>
        </header>
      )}
      <DropZone locale={locale} accept={tool.accept} multiple={tool.multiple} files={files} onFiles={(f) => { setFiles(f); setPhase({ kind: "idle" }); setQuotaReason(null); }} />
      {visibleOptions.length > 0 && (
        <div class="ff-options">
          {visibleOptions.map((o) => (
            <label key={o.key}>
              {t(locale, o.labelKey)}
              {o.type === "select" ? (
                <select value={String(opts[o.key])} onChange={(e) => setOpts({ ...opts, [o.key]: (e.target as HTMLSelectElement).value })}>
                  {o.choices?.map((c) => <option key={c.value} value={c.value}>{c.labelKey ? t(locale, c.labelKey) : c.label ?? c.value}</option>)}
                </select>
              ) : o.type === "text" ? (
                <input type="text" value={String(opts[o.key])} placeholder={o.placeholder} onInput={(e) => setOpts({ ...opts, [o.key]: (e.target as HTMLInputElement).value })} />
              ) : (
                <input type={o.type === "range" ? "range" : "number"} min={o.min} max={o.max} step={o.step} value={Number(opts[o.key])} onInput={(e) => setOpts({ ...opts, [o.key]: Number((e.target as HTMLInputElement).value) })} />
              )}
            </label>
          ))}
        </div>
      )}
      <QuotaNotice locale={locale} reason={quotaReason} remaining={remaining} tier={tier} checkoutUrl={checkoutUrl} />
      <div>
        <button type="button" class="ff-btn" disabled={files.length === 0 || phase.kind === "running"} onClick={run} data-testid="run">
          {phase.kind === "running" ? t(locale, "common.running") : t(locale, "common.run")}
        </button>
      </div>
      {phase.kind === "running" && <Progress locale={locale} progress={phase.progress} />}
      {phase.kind === "done" && <ResultList locale={locale} result={phase.result} />}
      {phase.kind === "error" && (
        <div role="alert" class="ff-result">
          <span class="ff-error" data-testid="error">{phase.message}</span>
          <button type="button" class="ff-btn ff-btn--ghost" onClick={() => setPhase({ kind: "idle" })}>{t(locale, "common.retry")}</button>
        </div>
      )}
      <p class="ff-note">{t(locale, "common.privacyNote")}</p>
    </div>
  );
}
