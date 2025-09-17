import {
  ASKEM_HOSTNAME,
  ROUTES,
  SUPPORTED_LANGUAGES,
} from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { Button, Container, CookieModal, CookiePage } from 'hds-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useCookieConsent from 'shared/hooks/useCookieConsent';

const CookieConsent: React.FC<{ asPage?: boolean }> = ({ asPage = false }) => {
  const locale = useLocale();
  const router = useRouter();
  const { axios } = useBackendAPI();
  const { pathname, asPath, query } = router;
  const { t } = useTranslation();
  const submittedApplication = useSearchParams().get('submittedApplication');

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

  const { onAllConsentsGiven, onConsentsParsed, optionalCookies } =
    useCookieConsent();

  const { groups } = optionalCookies;
  const { cookies } = groups[0];

  const contentSource = {
    siteName: text.title[locale],
    currentLanguage: locale,
    optionalCookies: {
      groups: [
        {
          commonGroup: 'statistics',
          cookies: [
            ...cookies,
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
    onConsentsParsed,
    onAllConsentsGiven,
    focusTargetSelector: '#main_content',
  };

  const handleBack = (): void => {
    if (submittedApplication) {
      void router.push({
        pathname: ROUTES.APPLICATION_FORM,
        query: { id: submittedApplication, isSubmitted: true },
      });
    } else {
      void router.back();
    }
  };

  return asPage ? (
    <>
      <CookiePage contentSource={contentSource} />
      <Container>
        <Button onClick={handleBack}>
          {t('common:applications.actions.back')}
        </Button>
      </Container>
    </>
  ) : (
    <CookieModal contentSource={contentSource} />
  );
};

export default CookieConsent;
