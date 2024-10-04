import { Button, Container, ContentSource, CookieModal, CookiePage } from 'hds-react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocale from 'shared/hooks/useLocale';
import { createAxios } from 'tet/youth/backend-api/backend-api';

import useCookieConsent from './useCookieConsent';

export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

const CookieConsent: React.FC<{ asPage?: boolean }> = ({ asPage = false }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { pathname, asPath, query } = router;

  const axios = createAxios();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onLanguageChange = (newLanguage: SUPPORTED_LANGUAGES): void => {
    void axios.get('/', {
      params: { lang: newLanguage },
    });

    void router.push({ pathname, query }, asPath, {
      locale: newLanguage,
    });
  };

  const { onAllConsentsGiven, onConsentsParsed } = useCookieConsent();

  const contentSource: ContentSource = {
    siteName: t('common:appName'),
    currentLanguage: locale,
    optionalCookies: {
      groups: [
        {
          commonGroup: 'statistics',
          cookies: [{ commonCookie: 'matomo' }],
        },
      ],
    },
    language: { onLanguageChange },
    onAllConsentsGiven,
    onConsentsParsed,
    focusTargetSelector: '#main_content',
  };

  const handleBack = (): void => {
    void router.back();
  };

  if (!mounted) {
    return null;
  }

  return asPage ? (
    <>
      <CookiePage contentSource={contentSource} />
      <Container>
        <Button onClick={handleBack}>{t('common:actions.back')}</Button>
      </Container>
    </>
  ) : (
    <CookieModal contentSource={contentSource} />
  );
};

export default CookieConsent;
