import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import 'benefit-shared/styles/app.css';
import 'hds-design-tokens';

import AuthProvider from 'benefit/applicant/auth/AuthProvider';
import CookieConsent from 'benefit/applicant/components/cookieConsent/CookieConsent';
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
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
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

  const showCookieBanner =
    process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER === '1' &&
    router.route !== ROUTES.COOKIE_SETTINGS;

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

      case ROUTES.COOKIE_SETTINGS:
        document.title = t('common:pageTitles.cookieSettings');
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
      isLocalStorageCsrf
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {showCookieBanner && <CookieConsent />}
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
