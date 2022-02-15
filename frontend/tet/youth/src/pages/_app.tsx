// import 'react-toastify/dist/ReactToastify.css';

import createQueryClient from 'tet/youth/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BaseApp from 'shared/components/app/BaseApp';
import Header from 'tet/youth/components/header/Header';
import Footer from 'tet/youth/components/footer/Footer';
import { linkedEventsUrl } from 'tet/youth/backend-api/backend-api';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';

const App: React.FC<AppProps> = (appProps) => (
  <QueryClientProvider client={createQueryClient()}>
    <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
  </QueryClientProvider>
);

export default appWithTranslation(App);
