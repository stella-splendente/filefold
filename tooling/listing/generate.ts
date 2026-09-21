/**
 * 스토어 등록용 문구를 TOOLS·i18n 에서 생성한다.
 * 출력: dist/listing/<suite>/{en,ko}.md, privacy-justification.md
 * 실행: pnpm --filter @filekit/tooling listing
 */
import fs from "node:fs";
import path from "node:path";
import { TOOLS } from "@filekit/ui/tools";
import { t, type Locale } from "@filekit/ui/i18n";

const SUITES = ["pdf", "image", "audio"] as const;
const OUT = path.resolve(import.meta.dirname, "../../dist/listing");
const SITE = process.env.SITE_URL ?? "https://filefold.pages.dev";

function listing(suite: (typeof SUITES)[number], locale: Locale): string {
  const tools = TOOLS.filter((x) => x.suite === suite);
  const name = `Filefold ${t("en", `suites.${suite}.name`)}`;
  const short = `${t(locale, `suites.${suite}.description`)} ${t(locale, "tagline")}`.slice(0, 132);
  const lines = [
    `# ${name} — ${locale}`,
    "",
    `## Short description (${short.length}/132)`,
    short,
    "",
    "## Full description",
    t(locale, "tagline"),
    "",
    t(locale, "common.privacyNote"),
    "",
    ...tools.map((x) => `• ${t(locale, `tools.${x.id}.name`)} — ${t(locale, `tools.${x.id}.description`)}`),
    "",
    locale === "ko"
      ? "무료: 한 번에 파일 3개까지, 각 25MB, 하루 10회. Pro(일회성 구매): 파일 수·횟수 제한 없음, 2GB까지."
      : "Free: up to 3 files per run, 25 MB each, 10 runs a day. Pro (one-time purchase): unlimited files and runs, up to 2 GB.",
    "",
    locale === "ko" ? "계정 없음. 추적 없음. 서버 없음." : "No account. No tracking. No servers.",
    "",
    `${locale === "ko" ? "웹에서도 사용" : "Also on the web"}: ${SITE}${locale === "ko" ? "/ko/" : "/"}`,
    "",
    "## Keywords",
    tools.flatMap((x) => x.keywords).join(", "),
    "",
    "## Category",
    "Productivity",
    "",
    "## Privacy policy URL",
    `${SITE}/privacy/`,
  ];
  return lines.join("\n") + "\n";
}

function justification(suite: (typeof SUITES)[number]): string {
  return [
    `# Privacy practices / permission justification — Filefold ${t("en", `suites.${suite}.name`)}`,
    "",
    "## Single purpose",
    `Local, in-browser ${suite} file tools (${TOOLS.filter((x) => x.suite === suite).map((x) => t("en", `tools.${x.id}.name`)).join(", ")}). Nothing else.`,
    "",
    "## Permission: storage",
    "Stores the free-plan daily usage counter and the Pro license state on the device. No personal data.",
    "",
    "## Host permissions",
    "None. The extension does not read or modify any website.",
    "",
    "## Remote code",
    "None. All code and WebAssembly modules are bundled in the package.",
    "",
    "## Data usage",
    "Files are processed entirely on the user's device and never transmitted. The only network request is the optional Pro license check to api.polar.sh, which sends the license key and our organization id only.",
    "",
    "## Data collection disclosure (Chrome Web Store form)",
    "Does not collect or use any user data. Not sold to third parties. Not used for unrelated purposes. Not used for creditworthiness.",
  ].join("\n") + "\n";
}

for (const suite of SUITES) {
  const dir = path.join(OUT, suite);
  fs.mkdirSync(dir, { recursive: true });
  for (const locale of ["en", "ko"] as Locale[]) fs.writeFileSync(path.join(dir, `${locale}.md`), listing(suite, locale));
  fs.writeFileSync(path.join(dir, "privacy-justification.md"), justification(suite));
  console.log("wrote", dir);
}
