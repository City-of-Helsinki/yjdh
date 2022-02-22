import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

const initLocale =
  <P,>(WrappedComponent: React.FC<P>): typeof WrappedComponent =>
  (props: P) => {
    const router = useRouter();
    const { locale } = router;
    const { i18n } = useTranslation();
    React.useEffect(() => {
      if (i18n?.changeLanguage) {
        void i18n.changeLanguage(locale ?? DEFAULT_LANGUAGE);
      }
    }, [i18n, locale]);
    return <WrappedComponent {...props} />;
  };

export default initLocale;
