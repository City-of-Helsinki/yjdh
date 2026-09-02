import * as Sentry from '@sentry/nextjs';
import { MutationCache, QueryCache } from '@tanstack/react-query';

const captureException = (error: Error): void => {
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
