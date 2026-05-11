import { ROUTES } from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Button,
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
  /* eslint-disable-next-line vars-on-top, no-var */
  var _paq: Array<Array<string | number | boolean>> | undefined;
}

const COOKIE_CONSENT_GROUP = {
  Essential: 'essential',
  Shared: 'shared',
  Statistics: 'statistics',
  Tunnistamo: 'tunnistamo',
};

const getCookieConsentSettings = (
  langCode = 'fi'
): Partial<CookieConsentContextProps> => {
  const cookieConsentProps: Partial<CookieConsentContextProps> = {
    onChange: (changeEvent) => {
      const { acceptedGroups } = changeEvent;

      const hasStatisticsConsent = acceptedGroups.includes(
        COOKIE_CONSENT_GROUP.Statistics
      );

      if (hasStatisticsConsent) {
        //  start tracking
        if (globalThis._paq) {
          globalThis._paq.push(['setConsentGiven'], ['setCookieConsentGiven']);
        }
      } else if (globalThis._paq) {
        // tell matomo to forget consent
        globalThis._paq.push(['forgetConsentGiven']);
      }
    },
    siteSettings,
    options: {
      focusTargetSelector: `#${MAIN_CONTENT_ID}`,
      language: langCode,
    },
  };

  return cookieConsentProps;
};

const CookieConsent: React.FC<{ asPage?: boolean }> = ({ asPage = false }) => {
  const locale = useLocale();
  const router = useRouter();
  const { t } = useTranslation();
  const submittedApplication = useSearchParams().get('submittedApplication');

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
