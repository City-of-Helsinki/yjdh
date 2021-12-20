import {
  getHeaderComponents,
  Translation,
} from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';
import { getFrontendUrl } from '../utils/url.utils';

const appNameTranslation: Translation = {
  fi: 'Kesäseteli',
  en: 'Summer job voucher',
  sv: 'Sommarsedeln',
};

const url = getFrontendUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;

const setup = fixture('Frontpage')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    headerComponents = getHeaderComponents(t, appNameTranslation);
  });

if (!isRealIntegrationsEnabled()) {
  setup.requestHooks(new HttpRequestHook(url));
}

test('user can authenticate and logout', async () => {
  const headerUser = await headerComponents.headerUser();
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
