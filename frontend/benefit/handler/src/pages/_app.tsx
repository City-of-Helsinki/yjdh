import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from 'benefit/handler/auth/AuthProvider';
import Footer from 'benefit/handler/components/footer/Footer';
import Header from 'benefit/handler/components/header/Header';
import AppContextProvider from 'benefit/handler/context/AppContextProvider';
import {
  getBackendDomain,
  getHeaders,
} from 'benefit-shared/backend-api/backend-api';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import useLocale from 'shared/hooks/useLocale';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = (appProps) => {
  const locale = useLocale();
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
