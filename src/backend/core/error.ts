export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly cause?: unknown;

  constructor(code: string, message: string, options?: { statusCode?: number; cause?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options?.statusCode;
    this.cause = options?.cause;
  }
}

export const normalizeError = (error: unknown, fallbackMessage: string): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
    return new AppError('REQUEST_FAILED', (error as { message: string }).message, { cause: error });
  }

  return new AppError('REQUEST_FAILED', fallbackMessage, { cause: error });
};
