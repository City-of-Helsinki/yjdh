import { QueryClient, QueryFunctionContext } from '@tanstack/react-query';
import Axios, { AxiosInstance } from 'axios';
import {
  BackendEndPoints,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';
import { isString } from 'shared/utils/type-guards';

const createAxios = (): AxiosInstance => {
  const config: Record<string, unknown> = {
    baseURL: getBackendDomain(),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getLastCookieValue('yjdhcsrftoken'),
    },
    withCredentials: true,
  };

  // Force http adapter in test environment for nock compatibility
  // Axios 1.x defaults to fetch adapter which nock doesn't intercept
  if (process.env.NODE_ENV === 'test') {
    config.adapter = ['http', 'xhr', 'fetch'];
  }

  return Axios.create(config);
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          process.env.NODE_ENV === 'production' &&
          failureCount < 3 &&
          !/40[134]/.test(error.message),
        staleTime: 30_000,
        queryFn: async <T>({ queryKey }: QueryFunctionContext): Promise<T> => {
          const [url] = queryKey;

          if (
            isString(url) &&
            BackendEndPoints.some((endpoint) => url.startsWith(endpoint))
          ) {
            const { data } = await createAxios().get<T>(
              `${getBackendDomain()}${url}`
            );
            return data;
          }
          throw new Error(`Invalid QueryKey: '${String(url)}'`);
        },
      },
    },
  });

export default createQueryClient;
