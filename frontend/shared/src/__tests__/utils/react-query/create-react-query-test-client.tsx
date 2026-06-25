import { QueryClient, QueryFunctionContext } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { isString } from 'shared/utils/type-guards';

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

        // v5: queryFn receives an object with { queryKey }
        queryFn: async <T,>({ queryKey }: QueryFunctionContext): Promise<T> => {
          const [url] = queryKey;

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
