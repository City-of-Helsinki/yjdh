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

import isHandlerNewBetaUiEnabled from '../../src/flags/is-handler-new-beta-ui-enabled';
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

// The mocked userinfo response replaces the real cross-origin backend response,
// so it must carry CORS headers itself. The app calls the backend with
// withCredentials, so the origin has to be echoed back (a "*" origin is invalid
// with credentials) and credentials must be explicitly allowed.
const respondWithUserinfo =
  (body: object, statusCode: number) =>
  (
    req: { headers: Record<string, string> },
    res: {
      headers: Record<string, string>;
      statusCode: number;
      setBody: (responseBody: object) => void;
    }
  ): void => {
    res.headers['content-type'] = 'application/json';
    res.headers['access-control-allow-origin'] = req.headers.origin || '*';
    res.headers['access-control-allow-credentials'] = 'true';
    res.statusCode = statusCode;
    res.setBody(body);
  };

const userinfoMock = RequestMock()
  .onRequestTo(getBackendUrl(BackendEndpoint.USER))
  .respond(respondWithUserinfo(handlerUser, 200));

const userinfo401Mock = RequestMock()
  .onRequestTo(getBackendUrl(BackendEndpoint.USER))
  .respond(respondWithUserinfo({}, 401));

test.requestHooks(userinfo401Mock)(
  'login page is shown when user is not authenticated',
  async (t) => {
    const loginPage = new LoginPage();
    await t.navigateTo(getFrontendUrl('/login?sessionExpired=true'));
    await loginPage.isLoaded();
    await loginPage.expectSessionExpiredMessage();
  }
);

if (!isHandlerNewBetaUiEnabled()) {
  test.requestHooks(userinfoMock)(
    'handler form is not found without id',
    async () => {
      const handlerFormPage = new HandlerForm();
      await handlerFormPage.applicationNotFound();
    }
  );
}
