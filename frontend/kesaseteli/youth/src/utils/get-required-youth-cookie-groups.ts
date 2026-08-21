import getRequiredCookieGroups from 'kesaseteli-shared/utils/getRequiredCookieGroups';
import type { RequiredGroups } from 'shared/utils/cookieConsentSettings';

const getRequiredYouthCookieGroups = (): RequiredGroups =>
  getRequiredCookieGroups();

export default getRequiredYouthCookieGroups;
