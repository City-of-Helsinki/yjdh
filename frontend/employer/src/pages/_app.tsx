import AxiosProvider from 'employer/backend-api/AxiosProvider';
import type { AppProps } from 'next/app';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps): React.ReactNode => (
  <AxiosProvider>
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  </AxiosProvider>
);

export default App;
