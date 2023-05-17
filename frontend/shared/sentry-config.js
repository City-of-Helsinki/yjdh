import * as Sentry from "@sentry/nextjs";
import maskGDPRData from 'shared/utils/mask-gdpr-data';

export default function sentryConfig() {
  Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
      attachStacktrace: true,
      maxBreadcrumbs: Number(process.env.NEXT_PUBLIC_SENTRY_MAX_BREADCRUMBS) || 100,
      // Adjust this value in production, or use tracesSampler for greater control
      // @see https://develop.sentry.dev/sdk/performance/
      tracesSampleRate: 1,
      beforeBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
        return {
          ...breadcrumb,
          message: maskGDPRData(breadcrumb.message),
          data: maskGDPRData(breadcrumb.data),
        };
      },
      beforeSend(event: Sentry.Event) {
        return maskGDPRData(event);
      },
  })
};