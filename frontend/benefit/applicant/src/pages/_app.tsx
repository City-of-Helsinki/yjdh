import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from 'benefit/applicant/auth/AuthProvider';
import {
  getBackendDomain,
  getHeaders,
} from 'benefit/applicant/backend-api/backend-api';
import Footer from 'benefit/applicant/components/footer/Footer';
import Header from 'benefit/applicant/components/header/Header';
import AppContextProvider from 'benefit/applicant/context/AppContextProvider';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { appWithTranslation } from 'benefit/applicant/i18n';
import { AppProps } from 'next/app';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import Content from 'shared/components/content/Content';
import Layout from 'shared/components/layout/Layout';
import ToastContainer from 'shared/components/toast/ToastContainer';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const locale = useLocale();
  return (
    <BackendAPIProvider
      baseURL={getBackendDomain()}
      headers={getHeaders(locale)}
    >
      <AppContextProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <GlobalStyling />
              <Layout>
                <Header />
                <ToastContainer />
                <Content>
                  <Component {...pageProps} />
                </Content>
                <Footer />
              </Layout>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </AppContextProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
