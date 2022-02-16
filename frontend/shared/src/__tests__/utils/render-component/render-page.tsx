import { NextPage } from 'next';
import { NextRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { act, render } from 'shared/__tests__/utils/test-utils';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';
import Content from 'shared/components/content/Content';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';
import Layout from 'shared/components/layout/Layout';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

type Props = {
  backendUrl: string;
  Header: React.FC;
  Footer?: React.FC;
  AuthProvider?: React.FC;
};

const renderPage =
  ({
    backendUrl = 'http://localhost:8000',
    Header,
    Footer,
    AuthProvider,
  }: Props) =>
  async (
    Page: NextPage,
    router: Partial<NextRouter> = {}
  ): Promise<QueryClient> => {
    const axios = createAxiosTestContext(backendUrl);
    const queryClient = createReactQueryTestClient(axios, backendUrl);
    const children = (
      <ThemeProvider theme={theme}>
        <GlobalStyling />
        <Layout>
          <Header />
          <HDSToastContainer />
          <Content>
            <Page />
          </Content>
          {Footer && <Footer />}
        </Layout>
      </ThemeProvider>
    );

    // act because of async handlers in react-hook-form and react-query
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <BackendAPIContext.Provider value={createAxiosTestContext(backendUrl)}>
          <QueryClientProvider client={queryClient}>
            {AuthProvider ? <AuthProvider>{children}</AuthProvider> : children}
            <HiddenLoadingIndicator />
          </QueryClientProvider>
        </BackendAPIContext.Provider>,
        router
      );
    });
    return queryClient;
  };

export default renderPage;
