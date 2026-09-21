import { render } from "preact";
import "@filekit/ui/styles.css";
import { LicensePanel } from "@filekit/ui";
import { createExtRuntime } from "@filekit/ext-shared/ext-runtime";

const rt = createExtRuntime("image", import.meta.env as Record<string, string | undefined>);

render(
  <div class="ff-shell">
    <LicensePanel locale={rt.locale} client={rt.license} label={rt.browserLabel} checkoutUrl={rt.checkoutUrl} bundleUrl={rt.bundleUrl} />
  </div>,
  document.getElementById("app")!,
);
