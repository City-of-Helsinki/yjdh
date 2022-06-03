import HandlerForm from '@frontend/kesaseteli-shared/browser-tests/page-models/HandlerForm';
import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
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

test('handler form is not found without id', async () => {
  const handlerFormPage = new HandlerForm();
  await handlerFormPage.applicationNotFound();
});
