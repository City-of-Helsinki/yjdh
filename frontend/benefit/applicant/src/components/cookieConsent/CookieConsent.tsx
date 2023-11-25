import useLocale from 'benefit/applicant/hooks/useLocale';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { CookieModal } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const CookieConsent: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const { t } = useTranslation();
  const { axios } = useBackendAPI();
  const { pathname, asPath, query } = router;

  const onLanguageChange = (newLanguage: 'fi' | 'sv' | 'en'): void => {
    void axios.get(BackendEndpoint.USER_OPTIONS, {
      params: { lang: newLanguage },
    });

    void router.push({ pathname, query }, asPath, {
      locale: newLanguage,
    });
  };

  const contentSource = {
    siteName: t('common:appName'),
    currentLanguage: locale,
    optionalCookies: {
      cookies: [
        {
          commonGroup: 'statistics',
          commonCookie: 'matomo',
        },
      ],
    },
    language: {
      onLanguageChange,
    },
    focusTargetSelector: '#focused-element-after-cookie-consent-closed',
    onAllConsentsGiven: (consents: { matomo: boolean }) => {
      if (!consents.matomo) {
        console.log('stop matomo');
      }
    },
  };

  return <CookieModal contentSource={contentSource} />;
};

export default CookieConsent;
