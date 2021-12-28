import 'react-toastify/dist/ReactToastify.css';

import {
  getBackendDomain,
  getHeaders,
} from 'benefit-shared/backend-api/backend-api';
import Footer from 'benefit/handler/components/footer/Footer';
import Header from 'benefit/handler/components/header/Header';
import Layout from 'benefit/handler/components/layout/Layout';
import AppContextProvider from 'benefit/handler/context/AppContextProvider';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import Content from 'shared/components/content/Content';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import useLocale from 'shared/hooks/useLocale';
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
          <ThemeProvider theme={theme}>
            <GlobalStyling />
            <Layout>
              <Header />
              <HDSToastContainer />
              <Content>
                <Component {...pageProps} />
              </Content>
              <Footer />
            </Layout>
          </ThemeProvider>
        </QueryClientProvider>
      </AppContextProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
