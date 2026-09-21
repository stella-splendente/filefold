import { render } from "preact";
import "@filekit/ui/styles.css";
import { LicensePanel } from "@filekit/ui/components";
import { createExtRuntime } from "@filekit/ext-shared/ext-runtime";

const worker = new Worker(new URL("../../worker.ts", import.meta.url), { type: "module" });
const rt = createExtRuntime("image", import.meta.env as Record<string, string | undefined>, worker);

render(
  <div class="ff-shell">
    <LicensePanel locale={rt.locale} client={rt.license} label={rt.browserLabel} checkoutUrl={rt.checkoutUrl} bundleUrl={rt.bundleUrl} />
  </div>,
  document.getElementById("app")!,
);
