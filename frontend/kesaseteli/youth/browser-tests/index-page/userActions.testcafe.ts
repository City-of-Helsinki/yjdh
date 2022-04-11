import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import getYouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('can change to languages', async (t) => {
  let headerComponents = getHeaderComponents(
    t,
    await getYouthTranslations('fi')
  );
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('fi', 'sv');
  headerComponents = getHeaderComponents(t, await getYouthTranslations('sv'));
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('sv', 'en');
  headerComponents = getHeaderComponents(t, await getYouthTranslations('en'));
  await headerComponents.header().expectations.isPresent();
  await headerComponents.languageDropdown().actions.changeLanguage('en', 'fi');
  headerComponents = getHeaderComponents(t, await getYouthTranslations('fi'));
  await headerComponents.header().expectations.isPresent();
});
