// Structured logger — console in dev, Sentry in production

type Level = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  level:   Level;
  message: string;
  data?:   Record<string, unknown>;
}

function safeStringify(obj: unknown): string {
  try { return JSON.stringify(obj); } catch { return String(obj); }
}

export function log({ level, message, data }: LogEntry) {
  const ts   = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${message}${data ? ' ' + safeStringify(data) : ''}`;

  if (level === 'error' || level === 'security') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }

  // In production, send errors/security events to Sentry
  if (process.env.NODE_ENV === 'production') {
    try {
      const Sentry = require('@sentry/nextjs');
      if (level === 'error') {
        Sentry.captureMessage(message, { level: 'error', extra: data });
      } else if (level === 'security') {
        Sentry.captureMessage(`[SECURITY] ${message}`, { level: 'warning', extra: data });
      }
    } catch {} // Sentry not available — don't crash
  }
}

export const logger = {
  info:     (msg: string, data?: Record<string, unknown>) => log({ level: 'info',     message: msg, data }),
  warn:     (msg: string, data?: Record<string, unknown>) => log({ level: 'warn',     message: msg, data }),
  error:    (msg: string, data?: Record<string, unknown>) => log({ level: 'error',    message: msg, data }),
  security: (msg: string, data?: Record<string, unknown>) => log({ level: 'security', message: msg, data }),
};
