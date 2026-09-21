import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/*.browser.test.ts"],
    coverage: { provider: "v8", thresholds: { lines: 80 }, include: ["src/**/*.ts"], exclude: ["src/**/*.test.ts"] },
  },
});
