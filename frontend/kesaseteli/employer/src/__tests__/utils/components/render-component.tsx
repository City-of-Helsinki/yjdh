import AxiosTestContext from 'kesaseteli/employer/__tests__/utils/backend/axios-test-context';
import BackendAPIContext from 'kesaseteli/employer/backend-api/BackendAPIContext';
import { NextRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import getDefaultReactQueryTestClient from 'shared/__tests__/utils/react-query/get-default-react-query-test-client';
import { render, RenderResult } from 'test-utils';

const renderComponent = (
  Component: JSX.Element,
  client: QueryClient = getDefaultReactQueryTestClient(),
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIContext.Provider value={AxiosTestContext}>
      <QueryClientProvider client={client}>{Component}</QueryClientProvider>
    </BackendAPIContext.Provider>,
    router
  );

export default renderComponent;
