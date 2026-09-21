export type ErrorCode = "UNSUPPORTED_FORMAT" | "CORRUPT_FILE" | "OUT_OF_MEMORY" | "CANCELLED" | "INTERNAL";

export class CoreError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CoreError";
  }
}

export interface JobProgress {
  done: number;
  total: number;
  message?: string;
}

export type OnProgress = (progress: JobProgress) => void;

export interface JobResult {
  blob: Blob;
  filename: string;
  meta?: Record<string, unknown>;
}

/** 1-based, inclusive. */
export interface PageRange {
  from: number;
  to: number;
}

export const noProgress: OnProgress = () => {};
