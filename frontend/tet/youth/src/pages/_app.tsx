import 'hds-design-tokens';

import init from '@socialgouv/matomo-next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { appWithTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import BaseApp from 'shared/components/app/BaseApp';
// import Footer from 'tet/youth/components/footer/Footer';
import Header from 'tet/youth/components/header/Header';
import createQueryClient from 'tet/youth/query-client/create-query-client';

const CookieConsent = dynamic(() => import('../components/cookieConsent/CookieConsent'), { ssr: false });
// Need to import Footer dynamically because currently HDS has issues with SSR
const DynamicFooter = dynamic(() => import('tet/youth/components/footer/Footer'), {
  ssr: false,
});

const queryClient = createQueryClient();

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const MATOMO_JS_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE;
const MATOMO_PHP_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE;

const App: React.FC<AppProps> = (appProps) => {
  useEffect(() => {
    if (MATOMO_ENABLED === 'true' && MATOMO_URL && MATOMO_SITE_ID) {
      init({
        jsTrackerFile: MATOMO_JS_TRACKER_FILE,
        phpTrackerFile: MATOMO_PHP_TRACKER_FILE,
        url: MATOMO_URL,
        siteId: MATOMO_SITE_ID,
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CookieConsent />
      <BaseApp header={<Header />} footer={<DynamicFooter />} {...appProps} />
    </QueryClientProvider>
  );
};

export default appWithTranslation(App);
