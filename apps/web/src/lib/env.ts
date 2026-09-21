/** 스토어·결제 링크. 미설정이면 해당 버튼을 숨긴다. */
export const STORE_URLS = {
  chrome: import.meta.env.PUBLIC_STORE_CHROME_PDF as string | undefined,
  edge: import.meta.env.PUBLIC_STORE_EDGE_PDF as string | undefined,
  firefox: import.meta.env.PUBLIC_STORE_FIREFOX_PDF as string | undefined,
};

export function storeUrl(browser: keyof typeof STORE_URLS, suite: string): string | undefined {
  return import.meta.env[`PUBLIC_STORE_${browser.toUpperCase()}_${suite.toUpperCase()}`] as string | undefined;
}

export function checkoutUrl(suite: string): string | undefined {
  return import.meta.env[`PUBLIC_POLAR_CHECKOUT_${suite.toUpperCase()}`] as string | undefined;
}

export const POLAR_ORG_ID = (import.meta.env.PUBLIC_POLAR_ORG_ID as string | undefined) ?? "";
export const POLAR_BENEFITS = (import.meta.env.PUBLIC_POLAR_BENEFITS as string | undefined) ?? "{}";
export const BUNDLE_URL = import.meta.env.PUBLIC_POLAR_CHECKOUT_BUNDLE as string | undefined;
