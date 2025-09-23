import { ContentSource } from 'hds-react';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;

type OptionalCookies = ContentSource['optionalCookies'];

type UseCookieConsentHook = () => {
  onAllConsentsGiven: (consents: { matomo: boolean }) => void;
  onConsentsParsed: (consents: { matomo: boolean }) => void;
  optionalCookies: OptionalCookies;
};

const onAllConsentsGiven = (consents: { matomo: boolean }): void => {
  if (MATOMO_ENABLED === 'true' && consents.matomo) {
    //  start tracking
    // eslint-disable-next-line no-underscore-dangle
    window._paq.push(['setConsentGiven']);
    // eslint-disable-next-line no-underscore-dangle, unicorn/no-array-push-push
    window._paq.push(['setCookieConsentGiven']);
  }
};

const onConsentsParsed = (consents: { matomo: boolean }): void => {
  if (MATOMO_ENABLED === 'true') {
    if (consents.matomo === undefined) {
      // tell matomo to wait for consent:
      // eslint-disable-next-line no-underscore-dangle
      window._paq.push(['requireConsent']);
      // eslint-disable-next-line no-underscore-dangle, unicorn/no-array-push-push
      window._paq.push(['requireCookieConsent']);
      // eslint-disable-next-line sonarjs/no-collapsible-if
    } else if (consents.matomo === false) {
      // tell matomo to forget conset
      // eslint-disable-next-line no-underscore-dangle, unicorn/no-lonely-if
      if (window && window._paq) {
        // eslint-disable-next-line no-underscore-dangle
        window._paq.push(['forgetConsentGiven']);
      }
    }
  }
};

const useCookieConsent: UseCookieConsentHook = () => {
  const optionalCookies: OptionalCookies = {
    groups: [
      {
        commonGroup: 'statistics',
        cookies: [{ commonCookie: 'matomo' }],
      },
    ],
  };

  return { onAllConsentsGiven, onConsentsParsed, optionalCookies };
};

export default useCookieConsent;
