import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import 'benefit-shared/styles/app.css';
import 'hds-design-tokens';
import 'react-loading-skeleton/dist/skeleton.css';

import init from '@socialgouv/matomo-next';
import AuthProvider from 'benefit/applicant/auth/AuthProvider';
import Layout from 'benefit/applicant/components/layout/Layout';
import AppContextProvider from 'benefit/applicant/context/AppContextProvider';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { appWithTranslation } from 'benefit/applicant/i18n';
import {
  getBackendDomain,
  getHeaders,
} from 'benefit-shared/backend-api/backend-api';
import { setAppLoaded } from 'benefit-shared/utils/common';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import isServerSide from 'shared/server/is-server-side';

import { ROUTES } from '../constants';

const CookieConsent = dynamic(
  () => import('benefit/applicant/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

const queryClient = new QueryClient();

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const MATOMO_JS_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE;
const MATOMO_PHP_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE;

const App: React.FC<AppProps> = (appProps) => {
  const locale = useLocale();

  const router = useRouter();

  const { t } = useTranslation();

  useEffect(() => {
    if (MATOMO_ENABLED === 'true' && MATOMO_URL && MATOMO_SITE_ID) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      init({
        jsTrackerFile: MATOMO_JS_TRACKER_FILE,
        phpTrackerFile: MATOMO_PHP_TRACKER_FILE,
        url: MATOMO_URL,
        siteId: MATOMO_SITE_ID,
      });
    }
  }, []);

  const showCookieBanner =
    process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER === '1' &&
    router.route !== ROUTES.COOKIE_SETTINGS;

  useEffect(() => {
    setAppLoaded();
    switch (router.route) {
      case ROUTES.HOME:
        document.title = t('common:pageTitles.home');
        break;

      case ROUTES.DECISIONS:
        document.title = t('common:pageTitles.decisions');
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
      <AppContextProvider>
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
      </AppContextProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
