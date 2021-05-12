// import/prefer-default-export
import BackendAPIProvider from 'employer/backend-api/BackendAPIProvider';
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
  client: QueryClient = defaultClient
): RenderResult =>
  render(
    <BackendAPIProvider>
      <QueryClientProvider client={client}>{Component}</QueryClientProvider>
    </BackendAPIProvider>
  );
