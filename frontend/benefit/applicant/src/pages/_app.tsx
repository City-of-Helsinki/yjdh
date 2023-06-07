import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import 'benefit-shared/styles/app.css';

import AuthProvider from 'benefit/applicant/auth/AuthProvider';
import Layout from 'benefit/applicant/components/layout/Layout';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { appWithTranslation } from 'benefit/applicant/i18n';
import {
  getBackendDomain,
  getHeaders,
} from 'benefit-shared/backend-api/backend-api';
import { setAppLoaded } from 'benefit-shared/utils/common';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import isServerSide from 'shared/server/is-server-side';

import { ROUTES } from '../constants';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = (appProps) => {
  const locale = useLocale();

  const router = useRouter();

  const { t } = useTranslation();

  useEffect(() => {
    setAppLoaded();
    switch (router.route) {
      case ROUTES.HOME:
        document.title = t('common:pageTitles.home');
        break;

      case ROUTES.LOGIN:
        document.title = t('common:pageTitles.login');
        break;

      case ROUTES.ACCESSIBILITY_STATEMENT:
        document.title = t('common:pageTitles.accessibilityStatement');
        break;

      default:
        document.title = t('common:pageTitles.home');
        break;
    }
  }, [router, t]);

  return (
    <BackendAPIProvider
      baseURL={getBackendDomain()}
      headers={getHeaders(locale)}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BaseApp
            layout={Layout}
            title={!isServerSide() && document.title}
            {...appProps}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
