import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BaseApp from 'shared/components/app/BaseApp';

const App: React.FC<AppProps> = (appProps) => (
  <QueryClientProvider client={new QueryClient()}>
    <BaseApp {...appProps} />
  </QueryClientProvider>
);

export default appWithTranslation(App);
