import {
  CookieBanner,
  CookieConsentContextProvider,
  CookieSettingsPage,
} from 'hds-react';
import React, { useMemo } from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useCookieConsentParams from 'shared/hooks/useCookieConsentParams';
import useLocale from 'shared/hooks/useLocale';
import {
  getCookieConsentSiteSettings,
  LocalizedSiteName,
  OptionalGroups,
  RequiredGroups,
} from 'shared/utils/cookieConsentSettings';

type CookieConsentProps = {
  asPage?: boolean;
  siteName: string | Partial<LocalizedSiteName>;
  requiredGroups?: RequiredGroups;
  optionalGroups?: OptionalGroups;
};

const CookieConsent = ({
  asPage = false,
  siteName,
  requiredGroups,
  optionalGroups,
}: CookieConsentProps): React.ReactElement => {
  const locale = useLocale();

  const siteSettings = useMemo(
    () =>
      getCookieConsentSiteSettings({
        siteName,
        app: 'kesaseteli',
        requiredGroups,
        optionalGroups,
      }),
    [siteName, requiredGroups, optionalGroups]
  );

  const cookieConsentParams =
    useCookieConsentParams({
      siteSettings,
      options: {
        focusTargetSelector: `#${MAIN_CONTENT_ID}`,
        language: locale,
      },
    });

  return (
    <CookieConsentContextProvider {...cookieConsentParams}>
      {asPage ? <CookieSettingsPage /> : <CookieBanner />}
    </CookieConsentContextProvider>
  );
};

export default CookieConsent;
