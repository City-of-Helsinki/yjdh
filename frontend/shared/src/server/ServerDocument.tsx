import * as Sentry from '@sentry/browser';
import Document, {
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';
import PORTAL_ID from 'shared/contants/portal-id';

process.on('unhandledRejection', (err) => {
  Sentry.captureException(err);
});

process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
});

class ServerDocument extends Document<DocumentProps> {
  render(): React.ReactElement {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <div id={PORTAL_ID} />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default ServerDocument;
