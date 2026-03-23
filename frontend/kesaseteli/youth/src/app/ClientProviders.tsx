'use client';

import React from 'react';
import { QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { ReactQueryDevtools } from 'react-query/devtools';
import dynamic from 'next/dynamic';

import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import useMatomo from 'kesaseteli-shared/hooks/useMatomo';
import { COOKIE_CONSENT_SITE_NAME } from 'kesaseteli-shared/constants/cookie-consent';
import DefaultLayout from 'shared/components/layout/Layout';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import Content from 'shared/components/content/Content';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';

const CookieConsent = dynamic(
  () => import('kesaseteli-shared/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

const queryClient = createQueryClient();

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMatomoConfigured = useMatomo();

  return (
    <BackendAPIProvider baseURL={getBackendDomain()}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyling />
          
          {isMatomoConfigured && (
            <CookieConsent siteName={COOKIE_CONSENT_SITE_NAME} />
          )}

          <DefaultLayout>
            <Header />
            <HDSToastContainer />
            <Content>{children}</Content>
            <Footer />
          </DefaultLayout>

        </ThemeProvider>
        
        <HiddenLoadingIndicator />
        {process.env.NODE_ENV === 'development' && process.env.TEST_CAFE !== 'true' && (
          <ReactQueryDevtools />
        )}
      </QueryClientProvider>
    </BackendAPIProvider>
  );
}
