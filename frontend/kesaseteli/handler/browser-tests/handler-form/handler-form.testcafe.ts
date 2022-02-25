import { getHandlerFormPageComponents } from '@frontend/kesaseteli-shared/browser-tests/handler-form-page/handlerFormPage.components';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/kesaseteli-shared/browser-tests/utils/request-logger';
import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

fixture('Handler form')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('handler form is not found without id', async (t) => {
  const handlerFormPage = await getHandlerFormPageComponents(t);
  await handlerFormPage.expectations.applicationNotFound();
});
