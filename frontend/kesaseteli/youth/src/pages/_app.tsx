import 'react-toastify/dist/ReactToastify.css';
import 'hds-design-tokens';

import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import useMatomo from 'kesaseteli-shared/hooks/useMatomo';

const CookieConsent = dynamic(
  () => import('kesaseteli-shared/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

const queryClient = createQueryClient();

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED === 'true';

const App: React.FC<AppProps> = (appProps: AppProps) => {
  const { t } = useTranslation();
  useMatomo();

  return (
    <BackendAPIProvider baseURL={getBackendDomain()}>
      <QueryClientProvider client={queryClient}>
        {MATOMO_ENABLED && <CookieConsent siteName={t('common:appName')} />}
        <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
      </QueryClientProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
