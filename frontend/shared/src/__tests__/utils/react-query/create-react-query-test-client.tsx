import { DefaultOptions, QueryClient } from 'react-query';
import getDefaultReactQueryTestClient from 'shared/__tests__/utils/react-query/get-default-react-query-test-client';

const createReactQueryTestClient = (options?: DefaultOptions): QueryClient =>
  new QueryClient({
    defaultOptions: {
      ...getDefaultReactQueryTestClient().getDefaultOptions(),
      ...options,
    },
  });

export default createReactQueryTestClient;
