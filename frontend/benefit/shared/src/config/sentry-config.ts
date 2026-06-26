/* eslint-disable simple-import-sort/imports */
import type { BrowserOptions } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';
import { createSentryCommonOptions } from './sentry-common';
/* eslint-enable simple-import-sort/imports */

export default function sentryConfig(): void {
  const config: Partial<BrowserOptions> = {
    ...createSentryCommonOptions(),
    integrations: [
      ...(globalThis.window !== undefined &&
      typeof Sentry.browserTracingIntegration === 'function'
        ? [Sentry.browserTracingIntegration()]
        : []),
      ...(globalThis.window !== undefined &&
      typeof Sentry.replayIntegration === 'function'
        ? [Sentry.replayIntegration()]
        : []),
    ],
  };

  Sentry.init(config);
}
