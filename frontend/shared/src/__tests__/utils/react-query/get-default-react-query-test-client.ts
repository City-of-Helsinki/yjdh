import noop from 'lodash/noop';
import { QueryClient, setLogger } from 'react-query';

setLogger({
  // eslint-disable-next-line no-console
  log: console.log,
  // eslint-disable-next-line no-console
  warn: console.warn,
  error: () => noop,
});

const getDefaultReactQueryTestClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 99999,
        refetchOnWindowFocus: false,
      },
    },
  });

export default getDefaultReactQueryTestClient;
