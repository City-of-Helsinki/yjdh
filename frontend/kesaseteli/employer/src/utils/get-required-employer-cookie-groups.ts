import getRequiredCookieGroups from 'kesaseteli-shared/utils/getRequiredCookieGroups';
import type { RequiredGroups } from 'shared/utils/cookieConsentSettings';

const getRequiredEmployerCookieGroups = (): RequiredGroups =>
  getRequiredCookieGroups({
    includeSessionIdCookie: true, // Needed because of Django's session handling
    includeSamlSessionCookie: true, // Needed because of Suomi.fi login
    includeCsrfTokenCookie: true, // Needed because of POSTing data to backend
  });

export default getRequiredEmployerCookieGroups;
