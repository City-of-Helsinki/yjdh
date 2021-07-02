import { NextRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import getDefaultReactQueryTestClient from 'shared/__tests__/utils/react-query/get-default-react-query-test-client';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import { render, RenderResult } from 'test-utils';

import AxiosTestContext from '../../utils/test-utils/axios-test-context';

const renderComponent = (
  Component: JSX.Element,
  client: QueryClient = getDefaultReactQueryTestClient(),
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIContext.Provider value={AxiosTestContext}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={client}>{Component}</QueryClientProvider>
      </ThemeProvider>
    </BackendAPIContext.Provider>,
    router
  );

export default renderComponent;
