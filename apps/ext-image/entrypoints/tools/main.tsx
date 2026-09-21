import { render } from "preact";
import { useState } from "preact/hooks";
import "@filekit/ui/styles.css";
import { ToolList, ToolShell, t, toolById, toolsBySuite } from "@filekit/ui";
import { createExtRuntime } from "@filekit/ext-shared/ext-runtime";

const rt = createExtRuntime("image", import.meta.env as Record<string, string | undefined>);
const tools = toolsBySuite("image");

function App() {
  const initial = new URLSearchParams(location.search).get("tool");
  const [tool, setTool] = useState(toolById(initial ?? "") ?? tools[0]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 260px) minmax(0, 1fr)", gap: "var(--space)", padding: "var(--space)", maxWidth: "1100px", margin: "0 auto" }}>
      <aside>
        <h2 style={{ marginTop: 0 }}>{t(rt.locale, "suites.image.name")}</h2>
        <ToolList locale={rt.locale} tools={tools} currentId={tool.id} href={(x) => `?tool=${x.id}`} onSelect={(x) => { setTool(x); history.replaceState(null, "", `?tool=${x.id}`); }} />
        <p style={{ marginTop: "1rem" }}><a class="ff-btn ff-btn--ghost" href="/options.html">{t(rt.locale, "license.title")}</a></p>
      </aside>
      <main>
        <ToolShell locale={rt.locale} tool={tool} core={rt.core} license={rt.license} quota={rt.quota} checkoutUrl={rt.checkoutUrl} />
      </main>
    </div>
  );
}

render(<App />, document.getElementById("app")!);
