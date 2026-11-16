import * as Sentry from '@sentry/nextjs';
import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

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

const failWithStatus = async (status: number): Promise<void> => {
  const error = new AxiosError(
    'fail',
    'ERR',
    { url: '/v1/x/', method: 'get' } as never,
    {},
    { status } as never
  );
  await createClient()
    .fetchQuery({
      queryKey: ['axios', status],
      queryFn: async () => {
        throw error;
      },
    })
    .catch(() => {
      // error is reported via the query cache onError
    });
};

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

  it.each([401, 403])(
    'does not report expected %s responses',
    async (status) => {
      await failWithStatus(status);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    }
  );

  it('fingerprints other axios errors by status and endpoint', async () => {
    await failWithStatus(500);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(AxiosError),
      expect.objectContaining({
        fingerprint: ['{{ default }}', '500', 'get', '/v1/x/'],
      })
    );
  });
});
