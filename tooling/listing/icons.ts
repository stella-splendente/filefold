/**
 * 스위트별 아이콘: 둥근 사각 배경 + 흰 글리프 SVG 를 Chromium 으로 렌더해 16/32/48/128 PNG 로 저장.
 * 실행: pnpm --filter @filekit/tooling icons   (출력: apps/ext-<suite>/public/icon/*.png, apps/web/public/icon-<suite>.svg)
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "../..");

const GLYPH: Record<string, string> = {
  // 문서 + 접힌 모서리
  pdf: `<path d="M34 22h40l20 20v64a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z" fill="#fff"/><path d="M74 22v20h20" fill="#e5e7eb"/><rect x="42" y="60" width="44" height="6" rx="3" fill="#d64545"/><rect x="42" y="74" width="44" height="6" rx="3" fill="#d64545"/><rect x="42" y="88" width="28" height="6" rx="3" fill="#d64545"/>`,
  // 사진 + 산 + 해
  image: `<rect x="24" y="30" width="80" height="68" rx="8" fill="#fff"/><circle cx="48" cy="52" r="8" fill="#348ceb"/><path d="M32 90l22-26 14 16 10-10 18 20z" fill="#348ceb"/>`,
  // 파형
  audio: `<g fill="#fff"><rect x="26" y="54" width="8" height="20" rx="4"/><rect x="40" y="40" width="8" height="48" rx="4"/><rect x="54" y="30" width="8" height="68" rx="4"/><rect x="68" y="44" width="8" height="40" rx="4"/><rect x="82" y="34" width="8" height="60" rx="4"/><rect x="96" y="50" width="8" height="28" rx="4"/></g>`,
};
const BG: Record<string, string> = { pdf: "#d64545", image: "#348ceb", audio: "#7850c8" };

function svg(suite: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><rect width="128" height="128" rx="28" fill="${BG[suite]}"/>${GLYPH[suite]}</svg>`;
}

const browser = await chromium.launch({ channel: "chromium" });
for (const suite of Object.keys(GLYPH)) {
  const outDir = path.join(ROOT, `apps/ext-${suite}/public/icon`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(ROOT, `apps/web/public/icon-${suite}.svg`), svg(suite));
  for (const size of [16, 32, 48, 128]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg(suite).replace('width="128" height="128"', `width="${size}" height="${size}"`)}</body></html>`);
    await page.screenshot({ path: path.join(outDir, `${size}.png`), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
  }
  console.log("icons:", suite);
}
await browser.close();
