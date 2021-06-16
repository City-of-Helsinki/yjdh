import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

const initLocale = <P,>(
  WrappedComponent: React.FC<P>
): typeof WrappedComponent => (props: P) => {
  const router = useRouter();
  const { locale } = router;
  const { i18n } = useTranslation();
  React.useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);
  return <WrappedComponent {...props} />;
};

export default initLocale;
