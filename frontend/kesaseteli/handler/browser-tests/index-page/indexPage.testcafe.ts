import requestLogger from '@frontend/kesaseteli-shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { getFrontendUrl } from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  });

test('shows frontpage', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
});
