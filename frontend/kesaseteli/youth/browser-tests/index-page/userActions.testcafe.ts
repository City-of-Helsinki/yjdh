import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import {
  getHeaderComponents,
  Translation,
} from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

let headerComponents: ReturnType<typeof getHeaderComponents>;

const appTranslation: Translation = {
  fi: 'Nuorten kesäseteli',
  en: 'Summer Job Voucher for youth',
  sv: 'Sommarsedel för unga',
};

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    headerComponents = getHeaderComponents(t, appTranslation);
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
