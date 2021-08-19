import AxiosTestContext from 'kesaseteli/employer/__tests__/utils/backend/axios-test-context';
import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import { NextPage } from 'next';
import { NextRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderResult } from 'shared/__tests__/utils/test-utils';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';
import Content from 'shared/components/content/Content';
import Layout from 'shared/components/layout/Layout';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

const renderPage = (
  Page: NextPage,
  client: QueryClient,
  router: Partial<NextRouter> = {}
): RenderResult =>
  render(
    <BackendAPIContext.Provider value={AxiosTestContext}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <Layout>
              <Header />
              <Content>
                <Page />
              </Content>
              <Footer />
            </Layout>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BackendAPIContext.Provider>,
    router
  );

export default renderPage;
