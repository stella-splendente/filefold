import { toBlobURL } from "@ffmpeg/util";
import { registerFFmpegCore } from "./ffmpeg";

/**
 * 웹용: 코어를 jsDelivr 에서 받아 blob URL 로 로드한다 (교차 출처 워커 import 회피).
 * 버전은 설치된 @ffmpeg/core 와 맞춘다. 사용자 파일은 전송되지 않는다. 엔진 바이너리만 내려받는다.
 */
const VERSION = "0.12.10";
const BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${VERSION}/dist/esm`;

registerFFmpegCore(async () => ({
  coreURL: await toBlobURL(`${BASE}/ffmpeg-core.js`, "text/javascript"),
  wasmURL: await toBlobURL(`${BASE}/ffmpeg-core.wasm`, "application/wasm"),
}));
