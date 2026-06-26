import type { BrowserOptions } from '@sentry/nextjs';

type CommonSentryOptions = Pick<
  BrowserOptions,
  | 'dsn'
  | 'environment'
  | 'release'
  | 'attachStacktrace'
  | 'maxBreadcrumbs'
  | 'tracesSampleRate'
  | 'tracePropagationTargets'
  | 'replaysSessionSampleRate'
  | 'replaysOnErrorSampleRate'
>;

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseCsv(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createSentryCommonOptions(): CommonSentryOptions {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    release: process.env.NEXT_PUBLIC_RELEASE,
    attachStacktrace: true,
    maxBreadcrumbs:
      Number(process.env.NEXT_PUBLIC_SENTRY_MAX_BREADCRUMBS) || 100,
    tracesSampleRate: parseNumber(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      0
    ),
    tracePropagationTargets: parseCsv(
      process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS
    ),
    replaysSessionSampleRate: parseNumber(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      0
    ),
    replaysOnErrorSampleRate: parseNumber(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      0
    ),
  };
}
