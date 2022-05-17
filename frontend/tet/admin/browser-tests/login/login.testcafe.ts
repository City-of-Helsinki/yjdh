import { doEmployerLogin } from '@frontend/employer/browser-tests/actions/employer-header.actions';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import Header from '@frontend/shared/browser-tests/page-models/Header';
import requestLogger, { filterLoggedRequests } from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getBackendDomain } from '@frontend/te-admn/src/backend-api/backend-api';

import getTetAdminTranslationsApi from '../../src/__tests__/utils/i18n/get-tet-admin-translations-api';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');
const translationsApi = getTetAdminTranslationsApi();

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger)),
  );

test('user can authenticate and log out', async (t) => {
  await doEmployerLogin(t, 'fi');
  const header = new Header(translationsApi);
  await header.clickLogoutButton();
  await header.userIsLoggedOut();
});

test('user can change languages', async (t) => {
  const header = new Header(translationsApi);
  await header.isLoaded();
  await header.changeLanguage('sv');
  const headerSv = new Header(translationsApi, 'sv');
  await headerSv.isLoaded();
  await headerSv.changeLanguage('en');
  const headerEn = new Header(translationsApi, 'en');
  await headerEn.isLoaded();
  await headerEn.changeLanguage('fi');
  await new Header(translationsApi, 'fi').isLoaded();
});
