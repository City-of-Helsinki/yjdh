import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';

import type { ConsentsCookie } from '../types/common';

const parseConsentsCookie = (): ConsentsCookie | undefined => {
  const consentsCookieEncoded = getLastCookieValue(
    'city-of-helsinki-cookie-consents'
  );
  if (!consentsCookieEncoded) {
    return undefined;
  }
  const consentsCookieString = decodeURIComponent(consentsCookieEncoded);
  return JSON.parse(consentsCookieString) as ConsentsCookie;
};

export const canShowAskem = (lang: string): boolean => {
  const consentsCookie = parseConsentsCookie();
  return consentsCookie && consentsCookie.rns && lang === 'fi';
};
