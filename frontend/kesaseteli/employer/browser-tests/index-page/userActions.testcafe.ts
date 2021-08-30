import { doLogin } from '@frontend/shared/browser-tests/actions/login-action';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';

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
  const suomiFiData = await doEmployerLogin(t);
  const headerUser = await headerComponents.headerUser();
  if (isRealIntegrationsEnabled() && suomiFiData?.user) {
    await headerUser.expectations.userIsLoggedIn(suomiFiData.user);
  }
  await headerUser.actions.clicklogoutButton();
  await headerUser.expectations.userIsLoggedOut();
});

test('can change to languages', async () => {
  const languageDropdown = await headerComponents.languageDropdown();
  const headerUser = await headerComponents.headerUser();
  await headerUser.expectations.loginButtonIsTranslatedAs('fi');
  await languageDropdown.actions.changeLanguage('fi', 'sv');
  await headerUser.expectations.loginButtonIsTranslatedAs('sv');
  await languageDropdown.actions.changeLanguage('sv', 'en');
  await headerUser.expectations.loginButtonIsTranslatedAs('en');
  await languageDropdown.actions.changeLanguage('en', 'fi');
  await headerUser.expectations.loginButtonIsTranslatedAs('fi');
});

if (isRealIntegrationsEnabled()) {
  test('preserve language through the suomifi login', async (t) => {
    const languageDropdown = await headerComponents.languageDropdown();
    const headerUser = await headerComponents.headerUser();
    await languageDropdown.actions.changeLanguage('fi', 'sv');
    await headerUser.actions.clickloginButton('sv');
    const { user } = await doLogin(t, 'sv');
    await headerUser.actions.clicklogoutButton(user, 'sv');
    await headerUser.expectations.userIsLoggedOut('sv');
    await languageDropdown.actions.changeLanguage('sv', 'en');
    await headerUser.actions.clickloginButton('en');
    await doLogin(t, 'en', user);
    await headerUser.actions.clicklogoutButton(user, 'en');
    await headerUser.expectations.userIsLoggedOut('en');
  });
}
