import type { Suite } from "@filekit/license";

/** 세 확장이 공유하는 WXT manifest 조각. */
export function suiteManifest(suite: Suite) {
  return {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: ["storage"],
    action: { default_popup: "popup.html", default_title: "__MSG_extName__" },
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
    browser_specific_settings: { gecko: { id: `${suite}@filefold.app`, strict_min_version: "115.0" } },
    icons: { 16: "icon/16.png", 32: "icon/32.png", 48: "icon/48.png", 128: "icon/128.png" },
  };
}
