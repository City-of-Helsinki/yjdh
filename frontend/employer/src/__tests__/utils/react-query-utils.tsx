import Axios from 'axios';
import AuthProvider from 'employer/auth/AuthProvider';
import getBackendUrl from 'employer/backend-api/backend-url';
import BackendAPIContext from 'employer/backend-api/BackendAPIContext';
import { NextPage } from 'next';
import { NextRouter } from 'next/router';
import React from 'react';
import {
  DefaultOptions,
  QueryClient,
  QueryClientProvider,
  setLogger,
} from 'react-query';
import { render, RenderResult } from 'test-utils';

const defaultClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

setLogger({
  // eslint-disable-next-line no-console
  log: console.log,
  // eslint-disable-next-line no-console
  warn: console.warn,
  error: () => {},
});

export const createQueryClient = (options?: DefaultOptions): QueryClient =>
  new QueryClient({
    defaultOptions: {
      ...defaultClient.getDefaultOptions(),
      ...options,
    },
  });

const axiosContext = Axios.create({
  baseURL: getBackendUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export const renderComponent = (
  Component: JSX.Element,
  client: QueryClient = defaultClient,
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIContext.Provider value={axiosContext}>
      <QueryClientProvider client={client}>{Component}</QueryClientProvider>
    </BackendAPIContext.Provider>,
    router
  );

export const renderPage = (
  Page: NextPage,
  client: QueryClient = defaultClient,
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIContext.Provider value={axiosContext}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Page />
        </AuthProvider>
      </QueryClientProvider>
    </BackendAPIContext.Provider>,
    router
  );
