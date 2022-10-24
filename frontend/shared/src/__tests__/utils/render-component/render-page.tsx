import { NextPage } from 'next';
import { NextRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { render } from 'shared/__tests__/utils/test-utils';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';
import ConfirmDialog from 'shared/components/confirm-dialog/ConfirmDialog';
import Portal from 'shared/components/confirm-dialog/Portal';
import Content from 'shared/components/content/Content';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';
import Layout from 'shared/components/layout/Layout';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import PORTAL_ID from 'shared/constants/portal-id';
import { DialogContextProvider } from 'shared/contexts/DialogContext';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import { i18n as I18n } from 'i18next';

type Props = {
  backendUrl: string;
  i18n: I18n;
  Header: React.FC;
  Footer?: React.FC;
  AuthProvider?: React.FC;
  confirmDialog?: boolean;
};

const renderPage =
  ({
    backendUrl = 'http://localhost:8000',
    i18n,
    Header,
    Footer,
    AuthProvider,
    confirmDialog,
  }: Props) =>
  (Page: NextPage, router: Partial<NextRouter> = {}): QueryClient => {
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

    render(
      <BackendAPIContext.Provider value={createAxiosTestContext(backendUrl)}>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <DialogContextProvider>
              {AuthProvider ? (
                <AuthProvider>{children}</AuthProvider>
              ) : (
                children
              )}
              <HiddenLoadingIndicator />
              {confirmDialog && (
                <>
                  <Portal>
                    <ConfirmDialog />
                  </Portal>
                  <div id={PORTAL_ID} />
                </>
              )}
            </DialogContextProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </BackendAPIContext.Provider>,
      { isReady: true, locale: DEFAULT_LANGUAGE, ...router }
    );
    return queryClient;
  };

export default renderPage;
