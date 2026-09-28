import { FFmpeg } from "@ffmpeg/ffmpeg";
import { CoreError } from "../types";

/**
 * ffmpeg.wasm 단일 스레드 코어. SharedArrayBuffer 불필요.
 * 코어(js/wasm) 위치는 앱이 등록한다: 확장은 동봉 자산(core-bundled), 웹은 CDN(core-cdn).
 * 웹에서 동봉하지 않는 이유는 정적 호스팅의 파일당 크기 제한(25MB) 때문이다.
 */
export interface CoreSource { coreURL: string; wasmURL: string }
let resolveSource: (() => Promise<CoreSource>) | null = null;
let instance: Promise<FFmpeg> | null = null;

export function registerFFmpegCore(resolver: () => Promise<CoreSource>): void {
  resolveSource = resolver;
  instance = null;
}

export function getFFmpeg(): Promise<FFmpeg> {
  if (!instance) {
    instance = (async () => {
      if (!resolveSource) throw new CoreError("INTERNAL", "ffmpeg 코어 위치가 등록되지 않았습니다");
      const ffmpeg = new FFmpeg();
      const { coreURL, wasmURL } = await resolveSource();
      const ok = await ffmpeg.load({ coreURL, wasmURL });
      if (!ok) throw new CoreError("INTERNAL", "ffmpeg 엔진을 불러오지 못했습니다");
      return ffmpeg;
    })().catch((err) => {
      instance = null;
      throw err instanceof CoreError ? err : new CoreError("INTERNAL", `ffmpeg 로드 실패: ${(err as Error)?.message ?? err}`);
    });
  }
  return instance;
}

export interface RunOptions {
  inputName: string;
  outputName: string;
  args: string[];
  onProgress?: (ratio: number) => void;
}

/** 입력 파일을 가상 FS 에 쓰고 ffmpeg 를 실행한 뒤 출력 바이트를 돌려준다. */
export async function runFFmpeg(input: Blob, opts: RunOptions): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg();
  const onProgress = ({ progress }: { progress: number }) => opts.onProgress?.(Math.max(0, Math.min(1, progress)));
  ffmpeg.on("progress", onProgress);
  try {
    await ffmpeg.writeFile(opts.inputName, new Uint8Array(await input.arrayBuffer()));
    const code = await ffmpeg.exec(["-hide_banner", "-loglevel", "error", "-i", opts.inputName, ...opts.args, opts.outputName]);
    if (code !== 0) throw new CoreError("CORRUPT_FILE", "파일을 처리할 수 없습니다. 손상되었거나 지원하지 않는 형식입니다");
    const out = await ffmpeg.readFile(opts.outputName);
    if (typeof out === "string" || out.length === 0) throw new CoreError("CORRUPT_FILE", "출력이 비어 있습니다");
    return out;
  } finally {
    ffmpeg.off("progress", onProgress);
    await ffmpeg.deleteFile(opts.inputName).catch(() => {});
    await ffmpeg.deleteFile(opts.outputName).catch(() => {});
  }
}
