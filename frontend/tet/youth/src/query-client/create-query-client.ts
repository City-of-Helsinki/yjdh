import { QueryClient } from 'react-query';

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          process.env.NODE_ENV === 'production' && failureCount < 3 && !/40[134]/.test((error as Error).message),
        staleTime: 30_000,
        notifyOnChangeProps: 'tracked',
      },
    },
  });

export default createQueryClient;
