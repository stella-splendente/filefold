import { chromium } from "@playwright/test";
const [path = "/", out = "home.png", width = "1280"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chromium" });
const p = await b.newPage({ viewport: { width: Number(width), height: 900 } });
await p.goto("http://127.0.0.1:4321" + path);
await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: true });
await b.close();
