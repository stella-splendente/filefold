export type AudioFormat = "mp3" | "wav" | "ogg" | "m4a";

export const AUDIO_MIME: Record<AudioFormat, string> = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4" };

/** 포맷별 인코더 인자. 비트레이트는 손실 포맷에만 적용. */
export function encoderArgs(format: AudioFormat, bitrateKbps: number): string[] {
  switch (format) {
    case "mp3": return ["-vn", "-c:a", "libmp3lame", "-b:a", `${bitrateKbps}k`];
    case "ogg": return ["-vn", "-c:a", "vorbis", "-strict", "-2", "-b:a", `${bitrateKbps}k`];
    case "m4a": return ["-vn", "-c:a", "aac", "-b:a", `${bitrateKbps}k`];
    case "wav": return ["-vn", "-c:a", "pcm_s16le"];
  }
}

export function stem(file: Blob & { name?: string }, fallback = "audio"): string {
  return (file.name ?? fallback).replace(/\.[^.]+$/, "") || fallback;
}

export function extOf(file: Blob & { name?: string }): string {
  const m = (file.name ?? "").match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "bin";
}
