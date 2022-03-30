import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from 'benefit/applicant/auth/AuthProvider';
import Layout from 'benefit/applicant/components/layout/Layout';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { appWithTranslation } from 'benefit/applicant/i18n';
import {
  getBackendDomain,
  getHeaders,
} from 'benefit-shared/backend-api/backend-api';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import Content from 'shared/components/content/Content';
import ToastContainer from 'shared/components/toast/ToastContainer';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import { ROUTES } from '../constants';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const locale = useLocale();

  const router = useRouter();

  const { t } = useTranslation();

  useEffect(() => {
    if (router.route === ROUTES.HOME)
      document.title = t('common:pageTitles.home');
    else if (router.route === ROUTES.LOGIN)
      document.title = t('common:pageTitles.login');
  }, [router, t]);

  return (
    <BackendAPIProvider
      baseURL={getBackendDomain()}
      headers={getHeaders(locale)}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <GlobalStyling />
            <Layout>
              <ToastContainer />
              <Content>
                <Component {...pageProps} />
              </Content>
            </Layout>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
