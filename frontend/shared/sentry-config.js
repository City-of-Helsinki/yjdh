import * as Sentry from '@sentry/nextjs';
import maskGDPRData from 'shared/utils/mask-gdpr-data';

// List of API errors to ignore in Sentry (mapped by URL pattern and HTTP status code)
const DEFAULT_IGNORED_API_ERRORS = [
  // 401 Unauthorized from /oidc/userinfo is expected when a user is not logged in yet (e.g. landing/login page)
  { url: '/oidc/userinfo', status: 401 },
];

/**
 * Parse a string value to a floating point number.
 * If the value is not a valid number, returns the fallback value.
 */
const parseSampleRate = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Configure Sentry with error handling, trace sampling, session replay, and custom ignore rules.
 *
 * @param {Array<{ url?: string | RegExp; status?: number }> | Array<{ url?: string | RegExp; errorMessage?: string }>} [ignoredApiErrors] - List of API errors to ignore in Sentry
 */
export default function sentryConfig(
  ignoredApiErrors = DEFAULT_IGNORED_API_ERRORS
) {
  /**
   * A number between 0 and 1, controlling the percentage chance a given transaction will be sent to Sentry.
   * (0 represents 0% while 1 represents 100%.) Applies equally to all transactions created in the app.
   * Either this or tracesSampler must be defined to enable tracing.
   *
   * @see https://develop.sentry.dev/sdk/performance/
   *
   * NOTE: Don't mix up with sampleRate (without traces prefix).
   * See https://docs.sentry.io/concepts/key-terms/sample-rates/#error-events
   */
  const tracesSampleRate = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    1
  );

  const tracePropagationTargets = (
    process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS || ''
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const replaysSessionSampleRate = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    0
  );

  const replaysOnErrorSampleRate = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    0
  );

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    release: process.env.NEXT_PUBLIC_RELEASE,
    attachStacktrace: true,
    maxBreadcrumbs:
      Number(process.env.NEXT_PUBLIC_SENTRY_MAX_BREADCRUMBS) || 100,
    integrations: [
      ...(typeof window !== 'undefined' &&
      typeof Sentry.browserTracingIntegration === 'function'
        ? [Sentry.browserTracingIntegration()]
        : []),
      ...(typeof window !== 'undefined' &&
      typeof Sentry.replayIntegration === 'function'
        ? [Sentry.replayIntegration()]
        : []),
    ],
    // Adjust this value in production, or use tracesSampler for greater control
    // @see https://develop.sentry.dev/sdk/performance/
    tracesSampleRate,
    tracePropagationTargets,
    replaysSessionSampleRate,
    replaysOnErrorSampleRate,
    beforeBreadcrumb(breadcrumb) {
      return {
        ...breadcrumb,
        message: maskGDPRData(breadcrumb.message),
        data: maskGDPRData(breadcrumb.data),
      };
    },
    /**
     * Filter out certain events before they are sent to Sentry.
     * Mask GDPR data from events.
     */
    beforeSend(event, hint) {
      const error = hint?.originalException;
      if (error) {
        const url = error.config?.url || error.request?.responseURL || '';
        const status =
          error.response?.status ?? error.status ?? error.statusCode;

        const isIgnored = ignoredApiErrors.some((ignored) => {
          if (!ignored.url) {
            return false;
          }

          // Is there an ignore rule for this url?
          const urlMatches =
            typeof ignored.url === 'string'
              ? url.includes(ignored.url)
              : ignored.url instanceof RegExp && ignored.url.test(url);

          if (!urlMatches) {
            return false;
          }

          // Does the ignore rule include status code and/or error message?
          const hasStatus =
            ignored.status !== undefined && ignored.status !== null;
          const hasErrorMessage =
            ignored.errorMessage !== undefined && ignored.errorMessage !== null;

          if (!hasStatus && !hasErrorMessage) {
            return false;
          }

          const statusMatches = !hasStatus || status === ignored.status;

          const errorMessageMatches =
            !hasErrorMessage ||
            (() => {
              const msg =
                error.message || (typeof error === 'string' ? error : '');
              return msg.includes(ignored.errorMessage);
            })();

          return statusMatches && errorMessageMatches;
        });

        if (isIgnored) {
          return null;
        }
      }
      return maskGDPRData(event);
    },
  });
}
