/** 지정 길이의 440Hz 사인파 16-bit mono WAV 를 만든다 (외부 의존성 없음). */
export function makeWav(seconds = 1, sampleRate = 8000): Uint8Array {
  const frames = Math.round(seconds * sampleRate);
  const dataBytes = frames * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + dataBytes, true); str(8, "WAVE");
  str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, dataBytes, true);
  for (let i = 0; i < frames; i++) v.setInt16(44 + i * 2, Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 12000), true);
  return new Uint8Array(buf);
}

export function wavBlob(seconds = 1): Blob {
  return new Blob([makeWav(seconds) as BlobPart], { type: "audio/wav" });
}
