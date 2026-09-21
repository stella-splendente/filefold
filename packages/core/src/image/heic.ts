/**
 * HEIC → PNG. heic-to 는 document 를 쓰므로 워커가 아닌 메인 스레드에서만 호출한다.
 * (앱 쪽 ToolDefinition 이 워커에 넘기기 전에 이 함수로 먼저 바꾼다.)
 */
export async function heicToPngOnMainThread(file: Blob): Promise<Blob> {
  const { heicTo } = await import("heic-to/csp");
  return heicTo({ blob: file, type: "image/png", quality: 1 });
}
