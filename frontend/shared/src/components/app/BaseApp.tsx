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
import DefaultLayout from 'shared/components/layout/Layout';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import useIsRouting from 'shared/hooks/useIsRouting';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { isError } from 'shared/utils/type-guards';
import { ThemeProvider } from 'styled-components';

type Props = AppProps & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  layout?: React.FC;
  title?: string;
};

setLogger({
  log: (message) => {
    Sentry.captureMessage(String(message), 'log');
  },
  warn: (message) => {
    Sentry.captureMessage(String(message), 'warning');
  },
  error: (error) => {
    if (isError(error)) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), 'log');
    }
  },
});

const BaseApp: React.FC<Props> = ({
  Component,
  pageProps,
  header,
  footer,
  layout,
  title,
}) => {
  const { t } = useTranslation();
  const isRouting = useIsRouting();
  const LayoutComponent = layout ?? DefaultLayout;
  return (
    <>
      <ThemeProvider theme={theme}>
        <Head>
          <title>{title?.length > 0 ? title : t('common:appName')}</title>
        </Head>
        <GlobalStyling />
        <LayoutComponent>
          {header}
          <HDSToastContainer />
          <Content>
            {isRouting ? <PageLoadingSpinner /> : <Component {...pageProps} />}
          </Content>
          {footer}
        </LayoutComponent>
      </ThemeProvider>
      <HiddenLoadingIndicator />
      {process.env.NODE_ENV === 'development' &&
        process.env.TEST_CAFE !== 'true' && <ReactQueryDevtools />}
    </>
  );
};

export default initLocale(BaseApp);
