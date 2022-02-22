import 'react-toastify/dist/ReactToastify.css';

// import AuthProvider from 'tet/admin/auth/AuthProvider';
import Footer from 'tet/admin/components/footer/Footer';
import Header from 'tet/admin/components/header/Header';
import { getBackendDomain } from 'tet/admin/backend-api/backend-api';
import createQueryClient from 'tet/admin/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import { DialogContextProvider } from 'tet/admin/store/DialogContext';
import Portal from 'tet/admin/components/base/Portal';
import ConfirmDialog from 'tet/admin/components/base/ConfirmDialog';

const App: React.FC<AppProps> = (appProps) => (
  <BackendAPIProvider baseURL={getBackendDomain()}>
    <QueryClientProvider client={createQueryClient()}>
      <DialogContextProvider>
        <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
        <Portal>
          <ConfirmDialog />
        </Portal>
      </DialogContextProvider>
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(App);
