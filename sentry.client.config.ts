import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,        // 10% of transactions — adjust as needed
  replaysSessionSampleRate: 0,  // disable replays (saves quota)
  replaysOnErrorSampleRate: 0,
  beforeSend(event) {
    // Strip sensitive data before sending to Sentry
    if (event.request?.cookies) delete event.request.cookies;
    if (event.request?.headers?.authorization) delete event.request.headers.authorization;
    return event;
  },
});
