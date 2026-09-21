import { proxy, wrap, type Remote } from "comlink";
import type { OnProgress } from "../types";
import type { CoreApi } from "./api";

export type RemoteCore = Remote<CoreApi>;

/**
 * 워커는 core 패키지 안의 상대 경로로 만든다.
 * Vite/WXT 가 `new Worker(new URL("./entry.ts", import.meta.url))` 패턴을 빌드 시 번들한다.
 */
export function createCore(): RemoteCore {
  const worker = new Worker(new URL("./entry.ts", import.meta.url), { type: "module" });
  return wrap<CoreApi>(worker);
}

/** 콜백은 구조화 복제가 안 되므로 반드시 proxy 로 감싼다. */
export function progressProxy(onProgress: OnProgress): OnProgress {
  return proxy(onProgress) as unknown as OnProgress;
}
