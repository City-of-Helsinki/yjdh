import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import Header from '@frontend/shared/browser-tests/page-models/Header';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';

import getEmployerTranslationsApi from '../../src/__tests__/utils/i18n/get-employer-translations-api';
import { loginAndfillApplication } from '../actions/application.actions';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getThankYouPageComponents } from '../thankyou-page/thank-you.components';
import { getFrontendUrl, getUrlUtils } from '../utils/url.utils';
import {
  attachmentsMock,
  fetchEmployeeDataMock,
  MOCKED_EMPLOYEE_DATA,
  targetGroupsMock,
} from './application.mocks';
import { getStep1Components } from './step1.components';
import { getWizardComponents } from './wizard.components';

let step1Components: ReturnType<typeof getStep1Components>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getFrontendUrl('/');

fixture('Application')
  .page(url)
  .requestHooks(
    requestLogger,
    new HttpRequestHook(url, getBackendDomain()),
    fetchEmployeeDataMock,
    targetGroupsMock,
    attachmentsMock
  )
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    urlUtils = getUrlUtils(t);
    step1Components = getStep1Components(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(filterLoggedRequests(requestLogger), null, 2))
  );

if (isRealIntegrationsEnabled()) {
  test('Fills up employer form and retrieves its data when logged out and in', async (t: TestController) => {
    const {
      user,
      id: applicationId,
      ...application
    } = await loginAndfillApplication(t, 1, MOCKED_EMPLOYEE_DATA);
    const header = new Header(getEmployerTranslationsApi());
    await header.isLoaded();
    await header.clickLogoutButton();
    await doEmployerLogin(t, 'fi', user);
    const step1Form = await step1Components.form();
    await step1Form.expectations.isFulFilledWith(application);
  });
} else {
  test('Fills up employer form and retrieves its data when reloading page', async (t: TestController) => {
    const { id: applicationId, ...applicationData } =
      await loginAndfillApplication(t, 1, MOCKED_EMPLOYEE_DATA);
    const wizard = await getWizardComponents(t);
    await wizard.expectations.isPresent();
    await wizard.actions.clickGoToStep1Button();
    await urlUtils.actions.refreshPage();
    const step1Form = await step1Components.form();
    await step1Form.expectations.isPresent();
    await urlUtils.actions.refreshPage();
    await step1Form.expectations.isPresent();
    await step1Form.expectations.isFulFilledWith(applicationData);
    await urlUtils.expectations.urlChangedToApplicationPage(applicationId);
  });
}

test('can fill and send application and create another', async (t: TestController) => {
  const application = await loginAndfillApplication(t, 2, MOCKED_EMPLOYEE_DATA);
  const thankYouPage = getThankYouPageComponents(t);
  await thankYouPage.header();
  // Thank you page doesn't have summary - just verify "add another" button works
  const createNewApplicationButton =
    await thankYouPage.createNewApplicationButton();
  await createNewApplicationButton.actions.clickButton();
  await getWizardComponents(t);
  await urlUtils.expectations.urlHasNewApplicationId(application.id);
});
