import 'react-toastify/dist/ReactToastify.css';

import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';

const App: React.FC<AppProps> = (appProps: AppProps) => (
  <BackendAPIProvider baseURL={getBackendDomain()}>
    <QueryClientProvider client={createQueryClient()}>
      <BaseApp {...appProps} header={<Header />} footer={<Footer />} />
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(App);
