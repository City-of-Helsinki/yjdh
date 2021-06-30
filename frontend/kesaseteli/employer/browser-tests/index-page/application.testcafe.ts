import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';
import { getUrlUtils } from '../utils/url.utils';
import { getApplicationPageComponents } from './applicationPage.components';

let applicationPageComponents: ReturnType<typeof getApplicationPageComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getEmployerUiUrl('/');

fixture('Companypage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    urlUtils = getUrlUtils(t);
    applicationPageComponents = getApplicationPageComponents(t);
  });

test('creates new application when logged in', async (t: TestController) => {
  const expectations = await doEmployerLogin(t);
  // moves to application page after login
  await urlUtils.expectations.urlChangedToApplicationPage();
  if (isRealIntegrationsEnabled() && expectations) {
    const companyTable = await applicationPageComponents.companyTable(
      expectations.expectedCompany
    );
    await companyTable.expectations.isCompanyDataPresent();
  }
});
