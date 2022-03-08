import Axios, { AxiosInstance } from 'axios';
import { QueryClient, QueryFunctionContext, QueryKey } from 'react-query';
import { linkedEventsUrl, BackendEndPoints } from 'tet/youth/backend-api/backend-api';

export const createAxios = (): AxiosInstance =>
  Axios.create({
    baseURL: linkedEventsUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          process.env.NODE_ENV === 'production' && failureCount < 3 && !/40[134]/.test((error as Error).message),
        staleTime: 30_000,
        notifyOnChangeProps: 'tracked',
        queryFn: async <T>({ queryKey: [url] }: QueryFunctionContext<QueryKey, unknown[]>): Promise<T> => {
          // Best practice: https://react-query.tanstack.com/guides/default-query-function
          if ((isString(url) && BackendEndPoints.some((endpoint) => url.startsWith(endpoint))) || true) {
            const { data } = await createAxios().get<T>(`${linkedEventsUrl}${url.toLowerCase()}`, {
              params: {
                data_source: 'tet',
              },
            });
            return data;
          }
          throw new Error(`Invalid QueryKey: '${String(url)}'`);
        },
      },
    },
  });

export default createQueryClient;
