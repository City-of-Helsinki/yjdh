import 'react-toastify/dist/ReactToastify.css';

import {
  getBackendDomain,
  getHeaders,
} from 'benefit/handler/backend-api/backend-api';
import Footer from 'benefit/handler/components/footer/Footer';
import Header from 'benefit/handler/components/header/Header';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import Content from 'shared/components/content/Content';
import Layout from 'shared/components/layout/Layout';
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyling />
          <Layout>
            <Header />
            <Content>
              <Component {...pageProps} />
            </Content>
            <Footer />
          </Layout>
        </ThemeProvider>
      </QueryClientProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
