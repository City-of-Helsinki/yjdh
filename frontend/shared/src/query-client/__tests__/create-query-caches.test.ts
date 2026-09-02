import * as Sentry from '@sentry/nextjs';
import { QueryClient } from '@tanstack/react-query';

import createQueryCaches from '../create-query-caches';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

const createClient = (): QueryClient =>
  new QueryClient({
    ...createQueryCaches(),
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe('createQueryCaches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reports query failures to Sentry', async () => {
    const error = new Error('Query failed');
    const client = createClient();

    await expect(
      client.fetchQuery({
        queryKey: ['failed-query'],
        queryFn: async () => {
          throw error;
        },
      })
    ).rejects.toBe(error);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('reports mutation failures to Sentry', async () => {
    const error = new Error('Mutation failed');
    const client = createClient();
    const mutation = client
      .getMutationCache()
      .build<unknown, Error, Record<string, never>, unknown>(client, {
        mutationFn: async () => {
          throw error;
        },
      });

    await expect(mutation.execute({})).rejects.toBe(error);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
