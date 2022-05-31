import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import ConfirmDialog from 'shared/components/confirm-dialog/ConfirmDialog';
import Portal from 'shared/components/confirm-dialog/Portal';
import { DialogContextProvider } from 'shared/contexts/DialogContext';
import AuthProvider from 'tet/admin/auth/AuthProvider';
import { getBackendDomain } from 'tet/admin/backend-api/backend-api';
import Footer from 'tet/admin/components/footer/Footer';
import Header from 'tet/admin/components/header/Header';
import createQueryClient from 'tet/admin/query-client/create-query-client';
import PreviewContextProvider from 'tet/admin/store/PreviewContext';

const queryClient = createQueryClient();

const App: React.FC<AppProps> = (appProps) => (
  <BackendAPIProvider baseURL={getBackendDomain()}>
    <QueryClientProvider client={queryClient}>
      <DialogContextProvider>
        <PreviewContextProvider>
          <AuthProvider>
            <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
            <Portal>
              <ConfirmDialog />
            </Portal>
          </AuthProvider>
        </PreviewContextProvider>
      </DialogContextProvider>
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(App);
