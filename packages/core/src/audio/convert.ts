import { noProgress, type JobResult, type OnProgress } from "../types";
import { runFFmpeg } from "./ffmpeg";
import { AUDIO_MIME, encoderArgs, extOf, stem, type AudioFormat } from "./formats";

export interface ConvertAudioOptions { to: AudioFormat; bitrateKbps: number }

export async function convertAudio(file: Blob & { name?: string }, opts: ConvertAudioOptions, onProgress: OnProgress = noProgress): Promise<JobResult> {
  const out = await runFFmpeg(file, {
    inputName: `in.${extOf(file)}`,
    outputName: `out.${opts.to}`,
    args: encoderArgs(opts.to, opts.bitrateKbps),
    onProgress: (r) => onProgress({ done: Math.round(r * 100), total: 100 }),
  });
  const blob = new Blob([out as BlobPart], { type: AUDIO_MIME[opts.to] });
  return { blob, filename: `${stem(file)}.${opts.to}`, meta: { before: file.size, after: blob.size } };
}

export interface CompressAudioOptions { bitrateKbps: number }

/** 항상 mp3 로 낮은 비트레이트 출력. */
export async function compressAudio(file: Blob & { name?: string }, opts: CompressAudioOptions, onProgress: OnProgress = noProgress): Promise<JobResult> {
  const result = await convertAudio(file, { to: "mp3", bitrateKbps: opts.bitrateKbps }, onProgress);
  return { ...result, filename: `${stem(file)}-compressed.mp3` };
}

export interface ExtractAudioOptions { to: AudioFormat; bitrateKbps?: number }

/** 동영상(mp4/webm/mov 등)에서 오디오 트랙만 뽑는다. */
export async function extractAudio(file: Blob & { name?: string }, opts: ExtractAudioOptions, onProgress: OnProgress = noProgress): Promise<JobResult> {
  const result = await convertAudio(file, { to: opts.to, bitrateKbps: opts.bitrateKbps ?? 192 }, onProgress);
  return { ...result, filename: `${stem(file, "audio")}.${opts.to}` };
}
