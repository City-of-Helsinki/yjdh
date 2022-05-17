import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import Header from '@frontend/shared/browser-tests/page-models/Header';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import getYouthTranslationsApi from '../src/__tests__/utils/i18n/get-youth-translations-api';
import { getFrontendUrl } from './utils/url.utils';

const url = getFrontendUrl('/');
const translationsApi = getYouthTranslationsApi();

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

test('can change to languages', async () => {
  const headerFi = new Header(translationsApi);
  await headerFi.isLoaded();
  await headerFi.changeLanguage('sv');
  const headerSv = new Header(translationsApi, 'sv');
  await headerSv.isLoaded();
  await headerSv.changeLanguage('en');
  const headerEn = new Header(translationsApi, 'en');
  await headerEn.isLoaded();
  await headerEn.changeLanguage('fi');
  await headerFi.isLoaded();
});
