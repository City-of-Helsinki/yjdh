import { AxiosInstance } from 'axios';
import { QueryClient } from 'react-query';

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
        queryFn: async ({ queryKey: [url] }) => {
          if (typeof url === 'string') {
            const { data } = await axios.get(`${baseUrl}${url.toLowerCase()}`);
            return data;
          }
          throw new Error(`Invalid QueryKey: '${String(url)}'`);
        },
      },
    },
  });

export default createReactQueryTestClient;
