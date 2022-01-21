import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { getFrontendUrl } from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  });

test('shows frontpage', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
});
