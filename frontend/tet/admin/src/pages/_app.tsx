// import 'react-toastify/dist/ReactToastify.css';

// import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'tet/admin/components/footer/Footer';
import Header from 'tet/admin/components/header/Header';
// import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import createQueryClient from 'tet-shared/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';

const App: React.FC<AppProps> = (appProps) => (
  <BackendAPIProvider baseURL={'https://localhost:8000'}>
    <QueryClientProvider client={createQueryClient()}>
      <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(App);
// export default App;
