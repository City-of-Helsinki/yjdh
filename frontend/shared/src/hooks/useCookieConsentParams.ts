import { CookieConsentChangeEvent, CookieConsentContextProps } from 'hds-react';
import { useMemo } from 'react';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;
const COOKIE_CONSENT_GROUP = {
  Essential: 'essential',
  Shared: 'shared',
  Statistics: 'statistics',
  Tunnistamo: 'tunnistamo',
};

const onChange = (changeEvent: CookieConsentChangeEvent): void => {
  const { acceptedGroups } = changeEvent;

  const hasStatisticsConsent = acceptedGroups.includes(
    COOKIE_CONSENT_GROUP.Statistics
  );

  if (MATOMO_ENABLED === 'true') {
    if (hasStatisticsConsent) {
      //  start tracking
      if (window._paq) {
        window._paq.push(['setConsentGiven']);
        window._paq.push(['setCookieConsentGiven']);
      }
    } else {
      // tell matomo to forget consent
      if (window._paq) {
        window._paq.push(['forgetConsentGiven']);
      }
    }
  }
};

const useCookieConsentParams = ({
  siteSettings,
  options,
}: {
  siteSettings: CookieConsentContextProps['siteSettings'];
  options: CookieConsentContextProps['options'];
}): Partial<CookieConsentContextProps> => {
  return useMemo(
    () => ({
      onChange,
      siteSettings,
      options,
    }),
    [siteSettings, options]
  );
};

export default useCookieConsentParams;
