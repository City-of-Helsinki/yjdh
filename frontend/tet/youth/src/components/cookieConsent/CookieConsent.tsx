import { Button, Container, CookieModal, CookiePage } from 'hds-react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocale from 'shared/hooks/useLocale';
import { createAxios } from 'tet/youth/backend-api/backend-api'; // TODO

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

  if (!mounted) {
    return null;
  }

  const contentSource = {
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
    onAllConsentsGiven: (consents) => {
      if (consents.matomo) {
        //  start tracking
        window._paq.push(['setConsentGiven']);
        window._paq.push(['setCookieConsentGiven']);
      }
    },
    onConsentsParsed: (consents) => {
      if (consents.matomo === undefined) {
        // tell matomo to wait for consent:
        window._paq.push(['requireConsent']);
        window._paq.push(['requireCookieConsent']);
      } else if (consents.matomo === false) {
        // tell matomo to forget conset
        window._paq.push(['forgetConsentGiven']);
      }
    },
    focusTargetSelector: '#main_content',
  };

  const handleBack = (): void => {
    void router.back();
  };

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
