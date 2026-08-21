import getRequiredCookieGroups from 'kesaseteli-shared/utils/getRequiredCookieGroups';
import type { RequiredGroups } from 'shared/utils/cookieConsentSettings';

const getRequiredHandlerCookieGroups = (): RequiredGroups =>
  getRequiredCookieGroups({
    includeSessionIdCookie: true, // Needed because of Django's session handling
    includeCsrfTokenCookie: true, // Needed because of POSTing data to backend
  });

export default getRequiredHandlerCookieGroups;
