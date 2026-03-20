import '../styles/tables.css';
import '../styles/tabs.css';
import 'benefit-shared/styles/app.css';
import 'hds-design-tokens';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from 'benefit/handler/auth/AuthProvider';
import Footer from 'benefit/handler/components/footer/Footer';
import Header from 'benefit/handler/components/header/Header';
import AppContextProvider from 'benefit/handler/context/AppContextProvider';
import {
  getBackendDomain,
  getHeaders,
} from 'benefit-shared/backend-api/backend-api';
import { setAppLoaded } from 'benefit-shared/utils/common';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import useLocale from 'shared/hooks/useLocale';
import {
  getSessionStorageItem,
  setSessionStorageItem,
} from 'shared/utils/localstorage.utils';

import Layout from '../layout/Layout';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = (appProps) => {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    setAppLoaded();
  }, [router.pathname, router.isReady]);

  useEffect(() => {
    const pathname = window.location.pathname + window.location.search;
    const history = getSessionStorageItem('history');
    const historyArray = history ? history.split(',') : [];
    const samePage = historyArray.at(-1) === pathname;

    if (router.isReady && !samePage) {
      const newHistory =
        historyArray.length > 0 ? `${history},${pathname}` : pathname;
      setSessionStorageItem('history', newHistory);
    }
  }, [router.pathname, router.isReady]);

  return (
    <BackendAPIProvider
      baseURL={getBackendDomain()}
      headers={getHeaders(locale)}
      isLocalStorageCsrf
    >
      <AppContextProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BaseApp
              header={<Header />}
              footer={<Footer />}
              {...appProps}
              layout={Layout}
            />
          </AuthProvider>
        </QueryClientProvider>
      </AppContextProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
