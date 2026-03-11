import HandlerForm from '@frontend/kesaseteli-shared/browser-tests/page-models/HandlerForm';
import {
  BackendEndpoint,
  getBackendDomain,
  getBackendUrl,
} from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { RequestMock } from 'testcafe';

import LoginPage from '../page-models/LoginPage';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

const handlerUser = {
  name: 'Handler User',
  given_name: 'Handler',
  family_name: 'User',
};

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

const userinfoMock = RequestMock()
  .onRequestTo(getBackendUrl(BackendEndpoint.USER))
  .respond(handlerUser, 200);

const userinfo401Mock = RequestMock()
  .onRequestTo(getBackendUrl(BackendEndpoint.USER))
  .respond({}, 401);

test.requestHooks(userinfo401Mock)(
  'login page is shown when user is not authenticated',
  async (t) => {
    const loginPage = new LoginPage();
    await t.navigateTo(getFrontendUrl('/login?sessionExpired=true'));
    await loginPage.isLoaded();
    await loginPage.expectSessionExpiredMessage();
  }
);

test.requestHooks(userinfoMock)(
  'handler form is not found without id',
  async () => {
    const handlerFormPage = new HandlerForm();
    await handlerFormPage.applicationNotFound();
  }
);
