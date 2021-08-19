import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { loginAndfillInvoicerForm } from '../actions/application.actions';
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
  test("Fills up invoicer form and retrieves its data when logged out and in", async (t: TestController) => {
    const {
      user,
      id: applicationId,
      ...invoicerFormData
    } = await loginAndfillInvoicerForm(t);
    const headerUser = await headerComponents.headerUser();
    await headerUser.actions.clicklogoutButton();
    await doEmployerLogin(t, user);
    await urlUtils.expectations.urlChangedToApplicationPage(
      'fi',
      applicationId
    );
    const invoicerForm = await applicationPageComponents.invoicerForm();
    await invoicerForm.expectations.isPresent();
    await invoicerForm.expectations.isFulFilledWith(invoicerFormData);
  });
} else {
  test("Fills up invoicer form and retrieves its data when reloading page", async (t: TestController) => {
    const invoicerFormData = await loginAndfillInvoicerForm(t);
    const invoicerForm = await applicationPageComponents.invoicerForm();
    await invoicerForm.expectations.isFulFilledWith(invoicerFormData);
  });
}
