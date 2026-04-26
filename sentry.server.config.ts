import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.05,
  beforeSend(event) {
    // Never send DB connection strings or secrets to Sentry
    if (event.extra) {
      delete (event.extra as any).DATABASE_URL;
      delete (event.extra as any).password;
    }
    return event;
  },
});
