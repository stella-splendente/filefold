import { defineConfig } from "wxt";
import preact from "@preact/preset-vite";
import { suiteManifest } from "@filekit/ext-shared/wxt-suite";

export default defineConfig({
  srcDir: ".",
  modules: [],
  manifest: suiteManifest("audio"),
  vite: () => ({
    plugins: [preact()],
    define: { "import.meta.env.VITE_BROWSER": JSON.stringify(process.env.WXT_BROWSER ?? "chrome") },
    worker: { format: "es" },
    optimizeDeps: { exclude: ["pdfjs-dist"] },
  }),
});
