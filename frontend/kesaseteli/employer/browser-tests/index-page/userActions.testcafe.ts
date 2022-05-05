import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import getEmployerTranslationsApi from '../../src/__tests__/utils/i18n/get-employer-translations-api';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('user can authenticate and logout', async (t) => {
  const { translations } = getEmployerTranslationsApi();
  await doEmployerLogin(t, 'fi');
  const headerComponents = getHeaderComponents(t, translations);
  const headerUser = headerComponents.headerUser();
  await headerUser.actions.clicklogoutButton();
  await headerUser.expectations.userIsLoggedOut();
});

test('can change to languages', async (t) => {
  const { translations } = getEmployerTranslationsApi();
  const headerComponents = getHeaderComponents(t, translations);
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('sv');
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('en');
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('fi');
  await headerComponents.header().expectations.isPresent();
});
