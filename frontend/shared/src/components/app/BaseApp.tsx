import * as Sentry from '@sentry/browser';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { setLogger } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Content from 'shared/components/content/Content';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';
import initLocale from 'shared/components/hocs/initLocale';
import Layout from 'shared/components/layout/Layout';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import useIsRouting from 'shared/hooks/useIsRouting';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { isError } from 'shared/utils/type-guards';
import { ThemeProvider } from 'styled-components';

type Props = AppProps & {
  header: React.ReactNode;
  footer: React.ReactNode;
};

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
});

setLogger({
  log: (message) => {
    Sentry.captureMessage(String(message), Sentry.Severity.Log);
  },
  warn: (message) => {
    Sentry.captureMessage(String(message), Sentry.Severity.Warning);
  },
  error: (error) => {
    if (isError(error)) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), Sentry.Severity.Log);
    }
  },
});

const BaseApp: React.FC<Props> = ({ Component, pageProps, header, footer }) => {
  const { t } = useTranslation();
  const isRouting = useIsRouting();

  return (
    <>
      <ThemeProvider theme={theme}>
        <Head>
          <title>{t('common:appName')}</title>
        </Head>
        <GlobalStyling />
        <Layout>
          {header}
          <HDSToastContainer />
          <Content>
            {isRouting ? <PageLoadingSpinner /> : <Component {...pageProps} />}
          </Content>
          {footer}
        </Layout>
      </ThemeProvider>
      <HiddenLoadingIndicator />
      {process.env.NODE_ENV === 'development' &&
        process.env.TEST_CAFE !== 'true' && <ReactQueryDevtools />}
    </>
  );
};

export default initLocale(BaseApp);
