import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import getTranslations from '../../src/__tests__/utils/i18n/get-translations';
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
  await doEmployerLogin(t, 'fi');
  const headerComponents = getHeaderComponents(t, await getTranslations());
  const headerUser = headerComponents.headerUser();
  await headerUser.actions.clicklogoutButton();
  await headerUser.expectations.userIsLoggedOut();
});

test('can change to languages', async (t) => {
  let headerComponents = getHeaderComponents(t, await getTranslations());
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('fi', 'sv');
  headerComponents = getHeaderComponents(t, await getTranslations('sv'));
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('sv', 'en');
  headerComponents = getHeaderComponents(t, await getTranslations('en'));
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('en', 'fi');
  headerComponents = getHeaderComponents(t, await getTranslations('fi'));
  await headerComponents.header().expectations.isPresent();
});
