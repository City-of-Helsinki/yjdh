import { ROUTES } from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Button,
  CookieBanner,
  CookieConsentContextProvider,
  CookieSettingsPage,
} from 'hds-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useCookieConsentParams from 'shared/hooks/useCookieConsentParams';
import { getCookieConsentSiteSettings } from 'shared/utils/cookieConsentSettings';

const CookieConsent: React.FC<{ asPage?: boolean }> = ({ asPage = false }) => {
  const locale = useLocale();
  const router = useRouter();
  const { t } = useTranslation();
  const submittedApplication = useSearchParams().get('submittedApplication');

  const siteSettings = useMemo(
    () =>
      getCookieConsentSiteSettings({
        siteName: t('common:cookieConsent.siteName'),
        app: 'benefit',
      }),
    [t]
  );

  const cookieConsentParams = useCookieConsentParams({
    siteSettings,
    options: {
      focusTargetSelector: `#${MAIN_CONTENT_ID}`,
      language: locale,
    },
  });

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
    <CookieConsentContextProvider {...cookieConsentParams}>
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
