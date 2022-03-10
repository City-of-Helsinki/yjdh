import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';

const queryClient = createQueryClient();

const App: React.FC<AppProps> = (appProps) => (
  <BackendAPIProvider baseURL={getBackendDomain()}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
      </AuthProvider>
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(App);
