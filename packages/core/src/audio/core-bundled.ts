/// <reference path="../vite-env.d.ts" />
import { registerFFmpegCore } from "./ffmpeg";

/** 확장용: 코어 js/wasm 을 패키지에 동봉한다 (MV3 는 원격 코드 금지). */
registerFFmpegCore(async () => {
  const [{ default: coreURL }, { default: wasmURL }] = await Promise.all([
    import("@ffmpeg/core?url"),
    import("@ffmpeg/core/wasm?url"),
  ]);
  const abs = (u: string) => new URL(u, self.location.href).toString();
  return { coreURL: abs(coreURL), wasmURL: abs(wasmURL) };
});
