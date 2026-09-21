import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL ?? "https://filefold.pages.dev";

export default defineConfig({
  site,
  integrations: [preact(), sitemap()],
  output: "static",
  build: { inlineStylesheets: "auto" },
  vite: {
    worker: { format: "es" },
    optimizeDeps: { exclude: ["pdfjs-dist"] },
  },
});
