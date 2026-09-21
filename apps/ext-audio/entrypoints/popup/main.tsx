import { render } from "preact";
import "@filekit/ui/styles.css";
import { detectLocale, t, toolsBySuite } from "@filekit/ui";

const locale = detectLocale();
const open = (toolId?: string) => {
  const url = chrome.runtime.getURL(`/tools.html${toolId ? `?tool=${toolId}` : ""}`);
  chrome.tabs.create({ url });
  window.close();
};

function Popup() {
  return (
    <div class="ff" style={{ padding: "0.75rem", display: "grid", gap: "0.5rem" }}>
      <strong>{t(locale, "suites.audio.name")}</strong>
      {toolsBySuite("audio").map((tool) => (
        <button key={tool.id} type="button" class="ff-btn ff-btn--ghost" style={{ textAlign: "left" }} onClick={() => open(tool.id)}>
          {t(locale, `tools.${tool.id}.name`)}
        </button>
      ))}
      <button type="button" class="ff-btn" onClick={() => chrome.runtime.openOptionsPage()}>{t(locale, "license.title")}</button>
    </div>
  );
}

render(<Popup />, document.getElementById("app")!);
