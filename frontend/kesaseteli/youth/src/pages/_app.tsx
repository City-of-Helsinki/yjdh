import 'react-toastify/dist/ReactToastify.css';
import 'hds-design-tokens';

import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import { COOKIE_CONSENT_SITE_NAME } from 'kesaseteli-shared/constants/cookie-consent';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import useMatomo from 'kesaseteli-shared/hooks/useMatomo';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';

const CookieConsent = dynamic(
  () => import('kesaseteli-shared/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

const queryClient = createQueryClient();

const App: React.FC<AppProps> = (appProps: AppProps) => {
  const isMatomoConfigured = useMatomo();
  const router = useRouter();

  const showCookieBanner =
    (isMatomoConfigured ||
      process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER === '1') &&
    router.route !== ROUTES.COOKIE_SETTINGS;

  return (
    <BackendAPIProvider baseURL={getBackendDomain()}>
      <QueryClientProvider client={queryClient}>
        {showCookieBanner && (
          <CookieConsent siteName={COOKIE_CONSENT_SITE_NAME} />
        )}
        <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
      </QueryClientProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
