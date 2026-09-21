import { audioApi } from "./api-audio";
import { imageApi } from "./api-image";
import { pdfApi } from "./api-pdf";

/**
 * 전체 함수 표(타입용). 실제 워커는 스위트별 엔트리(entry-pdf/image/audio) 하나만 노출해
 * 각 확장 패키지가 자기 스위트의 엔진·wasm 만 동봉하도록 한다.
 */
export const api = { ...pdfApi, ...imageApi, ...audioApi };

export type CoreApi = typeof api;
