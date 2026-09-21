import { proxy, wrap, type Remote } from "comlink";
import type { OnProgress } from "../types";
import type { CoreApi } from "./api";

export type RemoteCore = Remote<CoreApi>;

/** 앱은 `new URL("@filekit/core/worker", import.meta.url)` 로 워커 URL 을 만든다. */
export function createCore(workerUrl: URL | string): RemoteCore {
  const worker = new Worker(workerUrl, { type: "module" });
  return wrap<CoreApi>(worker);
}

/** 콜백은 구조화 복제가 안 되므로 반드시 proxy 로 감싼다. */
export function progressProxy(onProgress: OnProgress): OnProgress {
  return proxy(onProgress) as unknown as OnProgress;
}
