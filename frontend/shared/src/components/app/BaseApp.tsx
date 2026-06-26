import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import Content from 'shared/components/content/Content';
import HiddenLoadingIndicator from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator';
import initLocale from 'shared/components/hocs/initLocale';
import DefaultLayout from 'shared/components/layout/Layout';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import HDSToastContainer from 'shared/components/toast/ToastContainer';
import useIsRouting from 'shared/hooks/useIsRouting';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

type Props = AppProps & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  layout?: React.ComponentType<React.PropsWithChildren<unknown>>;
  title?: string;
};

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showReactQueryDevtools =
    isMounted &&
    process.env.NODE_ENV === 'development' &&
    process.env.TEST_CAFE !== 'true';

  return (
    <>
      <ThemeProvider theme={theme}>
        <Head>
          <title>
            {title && title.length > 0 ? title : t('common:appName')}
          </title>
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
      {showReactQueryDevtools && <ReactQueryDevtools />}
    </>
  );
};

export default initLocale(BaseApp);
