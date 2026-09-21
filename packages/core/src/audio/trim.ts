import { CoreError, noProgress, type JobResult, type OnProgress } from "../types";
import { runFFmpeg } from "./ffmpeg";
import { AUDIO_MIME, encoderArgs, extOf, stem, type AudioFormat } from "./formats";

export interface TrimOptions { startSec: number; endSec: number }

const KNOWN: AudioFormat[] = ["mp3", "wav", "ogg", "m4a"];

/** 구간을 잘라낸다. 입력 포맷을 유지하되 모르는 포맷이면 wav 로 낸다. */
export async function trimAudio(file: Blob & { name?: string }, opts: TrimOptions, onProgress: OnProgress = noProgress): Promise<JobResult> {
  if (!(opts.endSec > opts.startSec) || opts.startSec < 0) throw new CoreError("INTERNAL", "끝 시각은 시작 시각보다 커야 합니다");
  const ext = extOf(file);
  const to: AudioFormat = (KNOWN as string[]).includes(ext) ? (ext as AudioFormat) : "wav";
  const out = await runFFmpeg(file, {
    inputName: `in.${ext}`,
    outputName: `out.${to}`,
    args: ["-ss", String(opts.startSec), "-to", String(opts.endSec), ...encoderArgs(to, 192)],
    onProgress: (r) => onProgress({ done: Math.round(r * 100), total: 100 }),
  });
  const blob = new Blob([out as BlobPart], { type: AUDIO_MIME[to] });
  return { blob, filename: `${stem(file)}-trimmed.${to}`, meta: { before: file.size, after: blob.size } };
}
