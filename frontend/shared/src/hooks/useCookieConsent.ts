import { ContentSource } from 'hds-react';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;

type OptionalCookies = ContentSource['optionalCookies'];

type UseCookieConsentHook = () => {
  onAllConsentsGiven: (consents: { matomo: boolean }) => void;
  onConsentsParsed: (consents: { matomo: boolean }) => void;
  optionalCookies: OptionalCookies;
};

const useCookieConsent: UseCookieConsentHook = () => {
  const onAllConsentsGiven = (consents: { matomo: boolean }): void => {
    if (MATOMO_ENABLED === 'true' && consents.matomo) {
      //  start tracking
      window._paq.push(['setConsentGiven']);
      window._paq.push(['setCookieConsentGiven']);
    }
  };

  const onConsentsParsed = (consents: { matomo: boolean }): void => {
    if (MATOMO_ENABLED === 'true') {
      if (consents.matomo === undefined) {
        // tell matomo to wait for consent:
        window._paq.push(['requireConsent']);
        window._paq.push(['requireCookieConsent']);
      } else if (consents.matomo === false) {
        // tell matomo to forget conset
        if (window && window._paq) {
          window._paq.push(['forgetConsentGiven']);
        }
      }
    }
  };

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
