import 'react-toastify/dist/ReactToastify.css';

import * as Sentry from '@sentry/browser';
import Axios from 'axios';
import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation, useTranslation } from 'next-i18next';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryFunctionContext,
  QueryKey,
  setLogger,
} from 'react-query';
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

import { BackendEndPoints, getBackendDomain } from '../backend-api/backend-api';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
});

setLogger({
  log: (message) => {
    Sentry.captureMessage(message);
  },
  warn: (message) => {
    Sentry.captureMessage(message);
  },
  error: (error) => {
    Sentry.captureException(error);
  },
});

const axios = Axios.create({
  baseURL: getBackendDomain(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        process.env.NODE_ENV === 'production' &&
        failureCount < 3 &&
        !/40[134]/.test((error as Error).message),
      staleTime: 30000,
      notifyOnChangeProps: 'tracked',
      queryFn: async <T,>({
        queryKey: [url],
      }: QueryFunctionContext<QueryKey, unknown[]>): Promise<T> => {
        // Best practice: https://react-query.tanstack.com/guides/default-query-function
        if (
          typeof url === 'string' &&
          BackendEndPoints.some((endpoint) => url.startsWith(endpoint))
        ) {
          const { data } = await axios.get<T>(
            `${getBackendDomain()}${url.toLowerCase()}`
          );
          return data;
        }
        throw new Error(`Invalid QueryKey: '${String(url)}'`);
      },
    },
  },
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const { t } = useTranslation();
  return (
    <BackendAPIProvider baseURL={getBackendDomain()}>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
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
};

export default appWithTranslation(initLocale(App));
