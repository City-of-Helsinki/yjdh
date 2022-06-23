import { AxiosInstance } from 'axios';
import {
  QueryClient,
  QueryFunctionContext,
  QueryKey,
  setLogger,
} from 'react-query';
import { isString } from 'shared/utils/type-guards';

// silence react-query errors: https://tkdodo.eu/blog/testing-react-query#silence-the-error-console
/* eslint-disable no-console */
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
});
/* eslint-enable no-console */

const createReactQueryTestClient = (
  axios: AxiosInstance,
  baseUrl: string
): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        queryFn: async <T,>({
          queryKey: [url],
        }: QueryFunctionContext<QueryKey, unknown[]>): Promise<T> => {
          if (isString(url)) {
            const { data } = await axios.get<T>(
              `${baseUrl}${url.toLowerCase()}`
            );
            return data;
          }
          throw new Error(`Invalid QueryKey: '${String(url)}'`);
        },
      },
    },
  });

export default createReactQueryTestClient;
