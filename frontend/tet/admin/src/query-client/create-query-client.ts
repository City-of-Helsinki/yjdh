import Axios, { AxiosInstance } from 'axios';
import { QueryClient, QueryFunctionContext, QueryKey } from 'react-query';
import { isString } from 'shared/utils/type-guards';
import { BackendEndPoints, getBackendDomain } from 'tet/admin/backend-api/backend-api';

const createAxios = (): AxiosInstance =>
  Axios.create({
    baseURL: getBackendDomain(),
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'yjdhcsrftoken',
    xsrfHeaderName: 'X-CSRFToken',
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
          if (isString(url) && BackendEndPoints.some((endpoint) => url.startsWith(endpoint))) {
            const { data } = await createAxios().get<T>(`${getBackendDomain()}${url.toLowerCase()}`);
            return data;
          }
          throw new Error(`Invalid QueryKey: '${String(url)}'`);
        },
      },
    },
  });

export default createQueryClient;
