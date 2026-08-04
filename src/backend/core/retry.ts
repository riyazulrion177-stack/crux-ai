import { AppError, normalizeError } from './error';

interface RetryOptions {
  retries?: number;
  delayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultShouldRetry = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return true;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
    const message = (error as { message: string }).message.toLowerCase();
    return message.includes('network') || message.includes('timeout') || message.includes('failed to fetch');
  }

  return false;
};

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 150;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const appError = normalizeError(error, 'Request failed.');
      const canRetry = attempt < retries && shouldRetry(appError);

      if (!canRetry) {
        throw appError;
      }

      attempt += 1;
      await new Promise((resolve) => window.setTimeout(resolve, delayMs * attempt));
    }
  }
}
