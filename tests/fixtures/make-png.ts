/** 1x1 불투명 빨강 PNG (base64). 이미지 픽스처가 필요한 테스트에서 공용으로 쓴다. */
const PNG_1x1_RED_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

export function pngBytes(): Uint8Array {
  return Uint8Array.from(atob(PNG_1x1_RED_BASE64), (c) => c.charCodeAt(0));
}

export function pngBlob(): Blob {
  return new Blob([pngBytes() as BlobPart], { type: "image/png" });
}
