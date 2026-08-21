import 'react-toastify/dist/ReactToastify.css';
import 'hds-design-tokens';

import { QueryClientProvider } from '@tanstack/react-query';
import Footer from 'kesaseteli/handler/components/footer/Footer';
import Header from 'kesaseteli/handler/components/header/Header';
import { UserProvider } from 'kesaseteli/handler/contexts/UserContext';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import { COOKIE_CONSENT_SITE_NAME } from 'kesaseteli-shared/constants/cookie-consent';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import useMatomo from 'kesaseteli-shared/hooks/useMatomo';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import getRequiredCookieGroups from 'kesaseteli-shared/utils/getRequiredCookieGroups';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import ConfirmDialog from 'shared/components/confirm-dialog/ConfirmDialog';
import Portal from 'shared/components/confirm-dialog/Portal';
import {
  DialogContext,
  DialogContextProvider,
} from 'shared/contexts/DialogContext';
import { type RequiredGroups } from 'shared/utils/cookieConsentSettings';

const CookieConsent = dynamic(
  () => import('kesaseteli-shared/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

const queryClient = createQueryClient();

const getRequiredHandlerCookieGroups = (): RequiredGroups =>
  getRequiredCookieGroups({
    includeSessionIdCookie: true, // Needed because of Django's session handling
    includeCsrfTokenCookie: true, // Needed because of POSTing data to backend
  });

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
        <UserProvider>
          <DialogContextProvider>
            {showCookieBanner && (
              <CookieConsent
                requiredGroups={getRequiredHandlerCookieGroups()}
                siteName={COOKIE_CONSENT_SITE_NAME}
              />
            )}
            <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
            <Portal>
              <DialogContext.Consumer>
                {([state]) => <ConfirmDialog {...state} />}
              </DialogContext.Consumer>
            </Portal>
          </DialogContextProvider>
        </UserProvider>
      </QueryClientProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
