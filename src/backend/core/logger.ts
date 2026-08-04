type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = import.meta.env?.PROD === true;

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = meta ? { level, message, meta } : { level, message };

  if (isProd) {
    console[level](JSON.stringify(payload));
    return;
  }

  console[level](message, meta ?? '');
};

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};
