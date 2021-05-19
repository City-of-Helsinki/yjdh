import AuthProvider from 'employer/auth/AuthProvider';
import BackendAPIProvider from 'employer/backend-api/BackendAPIProvider';
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

export const renderComponent = (
  Component: JSX.Element,
  client: QueryClient = defaultClient,
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIProvider>
      <QueryClientProvider client={client}>{Component}</QueryClientProvider>
    </BackendAPIProvider>,
    router
  );

export const renderPage = (
  Page: NextPage,
  client: QueryClient = defaultClient,
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIProvider>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Page />
        </AuthProvider>
      </QueryClientProvider>
    </BackendAPIProvider>,
    router
  );
