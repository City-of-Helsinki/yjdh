// import 'react-toastify/dist/ReactToastify.css';

import createQueryClient from 'tet/youth/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BaseApp from 'shared/components/app/BaseApp';
import Header from 'tet/youth/components/header/Header';
import Footer from 'tet/youth/components/footer/Footer';
import Script from 'next/script';

const queryClient = createQueryClient();

const App: React.FC<AppProps> = (appProps) => (
  <>
    <Script
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
						var _paq = window._paq = window._paq || [];
						/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
						_paq.push(['trackPageView']);
						_paq.push(['enableLinkTracking']);
						(function() {
							var u="//webanalytics.digiaiiris.com/js/";
							_paq.push(['setTrackerUrl', u+'tracker.php']);
							_paq.push(['setSiteId', '915']);
							var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
							g.type='text/javascript'; g.async=true; g.src=u+'piwik.min.js'; s.parentNode.insertBefore(g,s);
						})();
  `,
      }}
    />
    <QueryClientProvider client={queryClient}>
      <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
    </QueryClientProvider>
  </>
);

export default appWithTranslation(App);
