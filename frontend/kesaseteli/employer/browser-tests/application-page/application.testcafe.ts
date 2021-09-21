import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { loginAndfillEmployerForm } from '../actions/application.actions';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';
import { getUrlUtils } from '../utils/url.utils';
import { getApplicationPageComponents } from './applicationPage.components';

let applicationPageComponents: ReturnType<typeof getApplicationPageComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getEmployerUiUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;

fixture('Application')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    urlUtils = getUrlUtils(t);
    applicationPageComponents = getApplicationPageComponents(t);
    headerComponents = getHeaderComponents(t);
  });

if (isRealIntegrationsEnabled()) {
  test('Fills up employer form and retrieves its data when logged out and in', async (t: TestController) => {
    const {
      user,
      id: applicationId,
      ...employerFormData
    } = await loginAndfillEmployerForm(t);
    const headerUser = await headerComponents.headerUser();
    await headerUser.actions.clicklogoutButton();
    await doEmployerLogin(t, 'fi', user);
    await urlUtils.expectations.urlChangedToApplicationPage(
      'fi',
      applicationId
    );
    const employerForm = await applicationPageComponents.employerForm();
    await employerForm.expectations.isPresent();
    await employerForm.expectations.isFulFilledWith(employerFormData);
  });
} else {
  test('Fills up employer form and retrieves its data when reloading page', async (t: TestController) => {
    const employerFormData = await loginAndfillEmployerForm(t);
    const employerForm = await applicationPageComponents.employerForm();
    await employerForm.expectations.isFulFilledWith(employerFormData);
  });
}
