import type { ToolDefinition, ToolOption } from "./types";

const AUDIO = ["audio/*", ".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".opus", ".wma", ".aiff"];
const VIDEO = ["video/*", ".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v"];

type Fmt = "mp3" | "wav" | "ogg" | "m4a";
const asFmt = (v: unknown, fallback: Fmt = "mp3"): Fmt => (["mp3", "wav", "ogg", "m4a"].includes(String(v)) ? (String(v) as Fmt) : fallback);

const format: ToolOption = {
  key: "to", type: "select", labelKey: "options.format", default: "mp3",
  choices: [{ value: "mp3", label: "MP3" }, { value: "wav", label: "WAV" }, { value: "m4a", label: "M4A" }],
};
const bitrate: ToolOption = {
  key: "bitrate", type: "select", labelKey: "options.bitrate", default: "192",
  choices: [{ value: "64", label: "64 kbps" }, { value: "96", label: "96 kbps" }, { value: "128", label: "128 kbps" }, { value: "192", label: "192 kbps" }, { value: "320", label: "320 kbps" }],
};

export const AUDIO_TOOLS: ToolDefinition[] = [
  {
    id: "convert-audio", suite: "audio", accept: AUDIO, multiple: false, browserOnly: true, options: [format, bitrate],
    keywords: ["convert audio", "audio converter", "wav to mp3", "m4a to mp3", "ogg to mp3"],
    run: (files, o, onProgress, core) => core.convertAudio(files[0], { to: asFmt(o.to), bitrateKbps: Number(o.bitrate) }, onProgress),
  },
  {
    id: "mp4-to-mp3", suite: "audio", accept: VIDEO, multiple: false, browserOnly: true,
    options: [format, bitrate], preset: { to: "mp3" },
    keywords: ["mp4 to mp3", "extract audio from video", "video to mp3", "convert mp4 to mp3"],
    run: (files, o, onProgress, core) => core.extractAudio(files[0], { to: "mp3", bitrateKbps: Number(o.bitrate) }, onProgress),
  },
  {
    id: "extract-audio", suite: "audio", accept: VIDEO, multiple: false, browserOnly: true, options: [format, bitrate],
    keywords: ["extract audio", "video to audio", "rip audio from video", "webm to mp3"],
    run: (files, o, onProgress, core) => core.extractAudio(files[0], { to: asFmt(o.to), bitrateKbps: Number(o.bitrate) }, onProgress),
  },
  {
    id: "trim-audio", suite: "audio", accept: AUDIO, multiple: false, browserOnly: true,
    options: [
      { key: "start", type: "number", labelKey: "options.startSec", default: 0, min: 0, step: 0.1 },
      { key: "end", type: "number", labelKey: "options.endSec", default: 30, min: 0.1, step: 0.1 },
    ],
    keywords: ["trim audio", "cut mp3", "audio cutter", "crop audio"],
    run: (files, o, onProgress, core) => core.trimAudio(files[0], { startSec: Number(o.start), endSec: Number(o.end) }, onProgress),
  },
  {
    id: "compress-audio", suite: "audio", accept: AUDIO, multiple: false, browserOnly: true, options: [{ ...bitrate, default: "96" }],
    keywords: ["compress audio", "reduce mp3 size", "audio compressor", "shrink audio file"],
    run: (files, o, onProgress, core) => core.compressAudio(files[0], { bitrateKbps: Number(o.bitrate) }, onProgress),
  },
];
