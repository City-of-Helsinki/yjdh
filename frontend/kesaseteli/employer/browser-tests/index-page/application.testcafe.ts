import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { fakeInvoicer } from '@frontend/shared/test/fake-objects';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';
import { getUrlUtils } from '../utils/url.utils';
import { getApplicationPageComponents } from './applicationPage.components';

let applicationPageComponents: ReturnType<typeof getApplicationPageComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getEmployerUiUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;

fixture('Companypage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    urlUtils = getUrlUtils(t);
    applicationPageComponents = getApplicationPageComponents(t);
    headerComponents = getHeaderComponents(t);
  });

test('retrieves created application when logged in and out', async (t: TestController) => {
  const suomiFiData = await doEmployerLogin(t);
  const applicationId = await urlUtils.expectations.urlChangedToApplicationPage('fi');
  if (isRealIntegrationsEnabled() && suomiFiData) {
    const companyTable = await applicationPageComponents.companyTable(
      suomiFiData.company
    );
    await companyTable.expectations.isCompanyDataPresent();
  }
  const invoicerForm = await applicationPageComponents.invoicerForm();
  await invoicerForm.expectations.isFulFilledWith({invoicer_name: '', invoicer_email: '', invoicer_phone_number: ''});
  const {invoicer_name, invoicer_email, invoicer_phone_number} = fakeInvoicer();
  await invoicerForm.actions.fillName(invoicer_name);
  await invoicerForm.actions.fillEmail(invoicer_email);
  await invoicerForm.actions.fillPhone(invoicer_phone_number);
  await invoicerForm.actions.clickSaveAndContinueButton();
  const headerUser = await headerComponents.headerUser();
  await headerUser.actions.clicklogoutButton();
  await doEmployerLogin(t);
  await urlUtils.expectations.urlChangedToApplicationPage('fi',applicationId);
  await invoicerForm.expectations.isPresent();
  await invoicerForm.expectations.isFulFilledWith({invoicer_name, invoicer_email, invoicer_phone_number});

});
