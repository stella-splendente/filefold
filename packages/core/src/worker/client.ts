import { proxy, wrap, type Remote } from "comlink";
import type { OnProgress } from "../types";
import type { CoreApi } from "./api";

export type RemoteCore = Remote<CoreApi>;

/**
 * 앱이 만든 Worker 를 감싼다. 워커 파일은 앱 쪽에서 `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`
 * 로 만들고, 그 파일은 `@filekit/core/worker/<suite>` 를 import 한다. 그래야 번들러가 앱마다 필요한 엔진만 동봉한다.
 */
export function wrapCore(worker: Worker): RemoteCore {
  return wrap<CoreApi>(worker);
}

/** 콜백은 구조화 복제가 안 되므로 반드시 proxy 로 감싼다. */
export function progressProxy(onProgress: OnProgress): OnProgress {
  return proxy(onProgress) as unknown as OnProgress;
}
