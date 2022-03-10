// import 'react-toastify/dist/ReactToastify.css';

import createQueryClient from 'tet/youth/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BaseApp from 'shared/components/app/BaseApp';
import Header from 'tet/youth/components/header/Header';
import Footer from 'tet/youth/components/footer/Footer';

const queryClient = createQueryClient();

const App: React.FC<AppProps> = (appProps) => (
  <QueryClientProvider client={queryClient}>
    <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
  </QueryClientProvider>
);

export default appWithTranslation(App);
