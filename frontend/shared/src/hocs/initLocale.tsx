import type { AppProps as NextJsAppProps } from 'next/app';
import { useRouter } from 'next/router';
import { SSRConfig, useTranslation } from 'next-i18next';
import React from 'react';

declare type AppProps = NextJsAppProps & {
  pageProps: SSRConfig;
};
const initLocale = (
  WrappedComponent: React.ComponentType<AppProps> | React.ElementType<AppProps>
): typeof WrappedComponent => (props: AppProps) => {
  const router = useRouter();
  const { locale } = router;
  const { i18n } = useTranslation();
  React.useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);
  return <WrappedComponent {...props} />;
};

export default initLocale;
