import {
  getHeaderComponents,
  Translation,
} from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getFrontendUrl } from 'kesaseteli/employer/utils/url.utils';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';

const appNameTranslation: Translation = {
  fi: 'Kesäseteli',
  en: 'Summer job voucher',
  sv: 'Sommarsedeln',
};

const url = getFrontendUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    headerComponents = getHeaderComponents(t, appNameTranslation);
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
  const header = await headerComponents.header();
  await header.expectations.titleIsTranslatedAs('fi');
  await languageDropdown.actions.changeLanguage('fi', 'sv');
  await header.expectations.titleIsTranslatedAs('sv');
  await languageDropdown.actions.changeLanguage('sv', 'en');
  await header.expectations.titleIsTranslatedAs('en');
  await languageDropdown.actions.changeLanguage('en', 'fi');
  await header.expectations.titleIsTranslatedAs('fi');
});
