import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';

const url = getEmployerUiUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    headerComponents = getHeaderComponents(t);
  });

test('user can authenticate and logout', async (t: TestController) => {
  const expectations = await doEmployerLogin(t);
  const headerUser = await headerComponents.headerUser();
  if (isRealIntegrationsEnabled() && expectations) {
    await headerUser.expectations.userIsLoggedIn(expectations.expectedUser);
  }
  await headerUser.actions.clicklogoutButton();
  await headerUser.expectations.userIsLoggedOut();
});

test('can change to languages', async () => {
  const languageDropdown = await headerComponents.languageDropdown();
  const headerUser = await headerComponents.headerUser();
  await languageDropdown.actions.changeLanguage('sv');
  await headerUser.expectations.loginButtonIsTranslatedAs('Logga in');
  await languageDropdown.actions.changeLanguage('en');
  await headerUser.expectations.loginButtonIsTranslatedAs('Login');
  await languageDropdown.actions.changeLanguage('fi');
  await headerUser.expectations.loginButtonIsTranslatedAs('Kirjaudu sisään');
});
