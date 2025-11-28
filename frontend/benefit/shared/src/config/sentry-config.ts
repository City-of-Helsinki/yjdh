/* eslint-disable simple-import-sort/imports */
import type { BrowserOptions } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';
/* eslint-enable simple-import-sort/imports */

export default function sentryConfig(): void {
  const config: Partial<BrowserOptions> = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: process.env.NEXT_PUBLIC_RELEASE,
    attachStacktrace: true,
    maxBreadcrumbs: 100,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'
    ),
    tracePropagationTargets: (
      process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS || ''
    ).split(','),
    replaysSessionSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0'
    ),
    replaysOnErrorSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '0'
    ),
  };

  Sentry.init(config);
}
