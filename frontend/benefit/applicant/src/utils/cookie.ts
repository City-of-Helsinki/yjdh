import { HELSINKI_CONSENT_COOKIE_NAME } from 'benefit-shared/constants';
import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';

import type { ConsentsCookie } from '../types/common';

const parseConsentsCookie = (): ConsentsCookie | undefined => {
  const consentsCookieEncoded = getLastCookieValue(
    HELSINKI_CONSENT_COOKIE_NAME
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
