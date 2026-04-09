import { ROUTES } from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Button,
  Container,
  CookieBanner,
  CookieConsentContextProps,
  CookieConsentContextProvider,
  CookieSettingsPage,
} from 'hds-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import siteSettings from '../../../public/assets/siteSettings.json';

declare global {
  var _paq: Array<Array<string | number | boolean>> | undefined;
}

const COOKIE_CONSENT_GROUP = {
  Essential: 'essential',
  Shared: 'shared',
  Statistics: 'statistics',
  Tunnistamo: 'tunnistamo',
};

const CookieConsent: React.FC<{ asPage?: boolean }> = ({ asPage = false }) => {
  const locale = useLocale();
  const router = useRouter();
  const { t } = useTranslation();
  const submittedApplication = useSearchParams().get('submittedApplication');

  const getCookieConsentSettings = (locale = 'fi') => {
    const cookieConsentProps: Partial<CookieConsentContextProps> = {
      onChange: (changeEvent) => {
        const { acceptedGroups } = changeEvent;

        const hasStatisticsConsent = acceptedGroups.includes(
          COOKIE_CONSENT_GROUP.Statistics
        );

        if (hasStatisticsConsent) {
          //  start tracking
          if (globalThis._paq) {
            globalThis._paq.push(['setConsentGiven']);
            globalThis._paq.push(['setCookieConsentGiven']);
          }
        } else {
          // tell matomo to forget consent
          if (globalThis._paq) {
            globalThis._paq.push(['forgetConsentGiven']);
          }
        }
      },
      siteSettings: siteSettings,
      options: {
        focusTargetSelector: `#${MAIN_CONTENT_ID}`,
        language: locale,
      },
    };

    return cookieConsentProps;
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

  return (
    <CookieConsentContextProvider {...getCookieConsentSettings(locale)}>
      {asPage ? (
        <>
          <CookieSettingsPage />
          <Button onClick={handleBack}>
            {t('common:applications.actions.back')}
          </Button>
        </>
      ) : (
        <CookieBanner />
      )}
    </CookieConsentContextProvider>
  );
};

export default CookieConsent;
