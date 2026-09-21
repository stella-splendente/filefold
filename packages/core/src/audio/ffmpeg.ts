import { FFmpeg } from "@ffmpeg/ffmpeg";
import { CoreError } from "../types";

/**
 * ffmpeg.wasm 단일 스레드 코어. SharedArrayBuffer 불필요.
 * core js/wasm 은 번들 자산 URL 로 넘겨서(확장: chrome-extension://, 웹: 같은 origin) MV3 CSP 를 지킨다.
 */
let instance: Promise<FFmpeg> | null = null;

export function getFFmpeg(): Promise<FFmpeg> {
  if (!instance) {
    instance = (async () => {
      const ffmpeg = new FFmpeg();
      const [{ default: coreURL }, { default: wasmURL }] = await Promise.all([
        import("@ffmpeg/core?url"),
        import("@ffmpeg/core/wasm?url"),
      ]);
      const ok = await ffmpeg.load({ coreURL: absolute(coreURL), wasmURL: absolute(wasmURL) });
      if (!ok) throw new CoreError("INTERNAL", "ffmpeg 엔진을 불러오지 못했습니다");
      return ffmpeg;
    })().catch((err) => {
      instance = null;
      throw err instanceof CoreError ? err : new CoreError("INTERNAL", `ffmpeg 로드 실패: ${(err as Error)?.message ?? err}`);
    });
  }
  return instance;
}

function absolute(url: string): string {
  return new URL(url, self.location.href).toString();
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
