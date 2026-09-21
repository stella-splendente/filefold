import { compressPdf, deletePages, imagesToPdf, mergePdfs, pdfToImages, reorderPages, rotatePdf, splitPdf } from "../pdf";
import { compressImage, convertImage, resizeImage } from "../image";
import { compressAudio, convertAudio, extractAudio, trimAudio } from "../audio";

/** 워커 안에서 노출되는 함수 표. onProgress 인자는 comlink.proxy 로 감싸서 넘긴다. */
export const api = {
  mergePdfs,
  splitPdf,
  rotatePdf,
  reorderPages,
  deletePages,
  imagesToPdf,
  pdfToImages,
  compressPdf,
  convertImage,
  compressImage,
  resizeImage,
  convertAudio,
  compressAudio,
  extractAudio,
  trimAudio,
};

export type CoreApi = typeof api;
