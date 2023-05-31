import 'react-toastify/dist/ReactToastify.css';
import '../styles/tabs.css';
import 'benefit-shared/styles/app.css';
import '../styles/tables.css';

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
import { appWithTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import useLocale from 'shared/hooks/useLocale';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = (appProps) => {
  const locale = useLocale();

  useEffect(() => {
    setAppLoaded();
  }, []);

  return (
    <BackendAPIProvider
      baseURL={getBackendDomain()}
      headers={getHeaders(locale)}
    >
      <AppContextProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
          </AuthProvider>
        </QueryClientProvider>
      </AppContextProvider>
    </BackendAPIProvider>
  );
};

export default appWithTranslation(App);
