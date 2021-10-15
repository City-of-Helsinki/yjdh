import { RenderResult } from '@testing-library/react';
import { NextRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { render } from 'shared/__tests__/utils/test-utils';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

export type Result = {
  queryClient: QueryClient;
  renderResult: RenderResult;
};

const renderComponent =
  (backendUrl = 'http://localhost:8000') =>
  (Element: JSX.Element, router: Partial<NextRouter> = {}): Result => {
    const axios = createAxiosTestContext(backendUrl);
    const queryClient = createReactQueryTestClient(axios, backendUrl);
    const renderResult = render(
      <BackendAPIContext.Provider value={createAxiosTestContext(backendUrl)}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>{Element}</ThemeProvider>
          <HiddenLoadingIndicator />
        </QueryClientProvider>
      </BackendAPIContext.Provider>,
      router
    );
    return { queryClient, renderResult };
  };

export default renderComponent;
