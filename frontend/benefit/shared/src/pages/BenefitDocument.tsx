import { LoadingSpinner } from 'hds-react';
import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import PORTAL_ID from 'shared/constants/portal-id';
import ServerDocument from 'shared/server/ServerDocument';

class BenefitDocument extends ServerDocument {
  render(): React.ReactElement {
    return (
      <Html>
        <Head>
          <link rel="icon" href="./favicons/favicon-32x32.ico" sizes="any" />
          <link rel="icon" href="./favicons/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="./favicons/apple-touch-icon.png" />
          <link rel="manifest" href="./favicons/manifest.webmanifest" />
          <meta name="robots" content="noindex,follow" />
        </Head>
        <body>
          <Main />
          <div
            id="app-loader"
            className="app-load-wrapper app-waits-for-client"
            aria-hidden="true"
          >
            <LoadingSpinner />
          </div>
          <div id={PORTAL_ID} />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default BenefitDocument;
