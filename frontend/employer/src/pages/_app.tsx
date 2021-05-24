import AuthProvider from 'employer/auth/AuthProvider';
import BackendAPIProvider from 'employer/backend-api/BackendAPIProvider';
import { AppProps } from 'next/app';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < 3 && !/40[134]/.test((error as Error).message),
    },
  },
});

const App = ({ Component, pageProps }: AppProps): React.ReactNode => (
  <BackendAPIProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      {process.env.NODE_ENV === 'development' &&
        process.env.TEST_CAFE !== 'true' && <ReactQueryDevtools />}
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default App;
