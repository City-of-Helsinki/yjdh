import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import BackendAPIProvider from 'kesaseteli/employer/backend-api/BackendAPIProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Content from 'shared/components/content/Content';
import Layout from 'shared/components/layout/Layout';
import initLocale from 'shared/hocs/initLocale';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < 3 && !/40[134]/.test((error as Error).message),
    },
  },
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <BackendAPIProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
      {process.env.NODE_ENV === 'development' &&
        process.env.TEST_CAFE !== 'true' && <ReactQueryDevtools />}
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(initLocale(App));
