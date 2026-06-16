import { CookieConsentChangeEvent, CookieConsentContextProps } from 'hds-react';
import { useMemo } from 'react';

import { trackPageView } from '../utils/matomo';

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
      // Start Matomo only after statistics consent is granted.
      if (globalThis._paq) {
        globalThis._paq.push(['setConsentGiven'], ['rememberConsentGiven']);
        // The trackPageView queued during initMatomo() is discarded by Matomo
        // when requireConsent is active. Track the current page explicitly now
        // so the first visit is not lost for users who just granted consent.
        trackPageView();
      }
    } else if (globalThis._paq) {
      // Tell Matomo to forget consent when statistics consent is removed.
      globalThis._paq.push(['forgetConsentGiven']);
    }
  }
};

const useCookieConsentParams = ({
  siteSettings,
  options,
}: {
  siteSettings: CookieConsentContextProps['siteSettings'];
  options: CookieConsentContextProps['options'];
}): Partial<CookieConsentContextProps> =>
  useMemo(
    () => ({
      onChange,
      siteSettings,
      options,
    }),
    [siteSettings, options]
  );

export default useCookieConsentParams;
