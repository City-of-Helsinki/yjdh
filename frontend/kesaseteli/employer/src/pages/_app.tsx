import 'react-toastify/dist/ReactToastify.css';

import * as Sentry from '@sentry/nextjs';
import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import Content from 'shared/components/content/Content';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';
import initLocale from 'shared/components/hocs/initLocale';
import Layout from 'shared/components/layout/Layout';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import { getBackendDomain } from '../backend-api/backend-api';

// Sentry logger
setLogger({
  log: message => {
    Sentry.captureMessage(message)
  },
  warn: message => {
    Sentry.captureMessage(message)
  },
  error: error => {
    Sentry.captureException(error)
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        process.env.NODE_ENV === 'production' &&
        failureCount < 3 &&
        !/40[134]/.test((error as Error).message),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <BackendAPIProvider baseURL={getBackendDomain()}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyling />
          <Layout>
            <Header />
            <HDSToastContainer />
            <Content>
              <Component {...pageProps} />
            </Content>
            <Footer />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
      <HiddenLoadingIndicator />
      {process.env.NODE_ENV === 'development' &&
        process.env.TEST_CAFE !== 'true' && <ReactQueryDevtools />}
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(initLocale(App));
