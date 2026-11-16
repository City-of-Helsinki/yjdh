import * as Sentry from '@sentry/nextjs';
import { MutationCache, QueryCache } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const EXPECTED_AUTH_STATUSES = new Set([401, 403]);

const captureException = (error: Error): void => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    // Unauthenticated responses are expected (e.g. users/me on login page)
    // and handled by the apps themselves.
    if (status && EXPECTED_AUTH_STATUSES.has(status)) {
      return;
    }
    // Minified stacks are identical for all axios errors, so group by status
    // and endpoint instead.
    Sentry.captureException(error, {
      tags: { http_status: status ?? 'none' },
      fingerprint: [
        '{{ default }}',
        String(status ?? 'none'),
        error.config?.method ?? '',
        error.config?.url ?? '',
      ],
    });
    return;
  }
  Sentry.captureException(error);
};

const createQueryCaches = (): {
  mutationCache: MutationCache;
  queryCache: QueryCache;
} => ({
  mutationCache: new MutationCache({ onError: captureException }),
  queryCache: new QueryCache({ onError: captureException }),
});

export default createQueryCaches;
