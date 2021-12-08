import {
  getHeaderComponents,
  Translation,
} from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { getFrontendUrl } from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;
let indexPageComponents: ReturnType<typeof getIndexPageComponents>;

const appTranslation: Translation = {
  fi: 'Nuorten kesäseteli',
  en: 'ENG Nuorten kesäseteli',
  sv: 'SV Nuorten kesäseteli',
};

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    headerComponents = getHeaderComponents(t, appTranslation);
    indexPageComponents = getIndexPageComponents(t);
  });

test('shows front page', async () => {
  await indexPageComponents.form();
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
