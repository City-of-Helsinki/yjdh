import {
  ASKEM_HOSTNAME,
  SUPPORTED_LANGUAGES,
} from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { CookieModal, CookiePage } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const CookieConsent: React.FC<{ asPage?: boolean }> = ({ asPage = false }) => {
  const locale = useLocale();
  const router = useRouter();
  const { axios } = useBackendAPI();
  const { pathname, asPath, query } = router;

  const onLanguageChange = (newLanguage: SUPPORTED_LANGUAGES): void => {
    void axios.get(BackendEndpoint.USER_OPTIONS, {
      params: { lang: newLanguage },
    });

    void router.push({ pathname, query }, asPath, {
      locale: newLanguage,
    });
  };

  type CookieTexts = {
    title: { fi: string; sv: string; en: string };
    askemDescription: { fi: string; sv: string; en: string };
  };

  const text: CookieTexts = {
    title: {
      fi: 'Helsinki-lisä',
      sv: 'Helsingforstillägg',
      en: 'Helsinki benefit',
    },
    askemDescription: {
      fi: 'Askem-reaktionappien toimintaan liittyvä tietue.',
      sv: 'En post relaterad till driften av reaktionsknappen Askem.',
      en: 'A record related to the operation of the Askem react buttons.',
    },
  };

  const askemDescription = text.askemDescription[locale];

  const contentSource = {
    siteName: text.title[locale],
    currentLanguage: locale,
    optionalCookies: {
      groups: [
        {
          commonGroup: 'statistics',
          cookies: [
            {
              id: 'rns',
              name: 'rnsbid',
              hostName: ASKEM_HOSTNAME,
              description: askemDescription,
              expiration: '-',
            },
            {
              id: 'rnsbid_ts',
              name: 'rnsbid_ts',
              hostName: ASKEM_HOSTNAME,
              description: askemDescription,
              expiration: '-',
            },
            {
              id: 'rns_reaction',
              name: 'rns_reaction_*',
              hostName: ASKEM_HOSTNAME,
              description: askemDescription,
              expiration: '-',
            },
          ],
        },
      ],
    },
    language: {
      onLanguageChange,
    },
    focusTargetSelector: '#main_content',
  };

  return asPage ? (
    <CookiePage contentSource={contentSource} />
  ) : (
    <CookieModal contentSource={contentSource} />
  );
};

export default CookieConsent;
