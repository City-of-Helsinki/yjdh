import requestLogger from '@frontend/kesaseteli-shared/browser-tests/utils/request-logger';
import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import TestController from 'testcafe';

import { loginAndfillApplication } from '../actions/application.actions';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getThankYouPageComponents } from '../thankyou-page/thank-you.components';
import { getFrontendUrl, getUrlUtils } from '../utils/url.utils';
import { getStep1Components } from './step1.components';
import { getStep2Components } from './step2.components';
import { getWizardComponents } from './wizard.components';

let step1Components: ReturnType<typeof getStep1Components>;
let step2Components: ReturnType<typeof getStep2Components>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getFrontendUrl('/');
let headerComponents: ReturnType<typeof getHeaderComponents>;

fixture('Application')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    urlUtils = getUrlUtils(t);
    step1Components = getStep1Components(t);
    step2Components = getStep2Components(t);
    headerComponents = getHeaderComponents(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(requestLogger.requests)
  );

if (isRealIntegrationsEnabled()) {
  test('Fills up employer form and retrieves its data when logged out and in', async (t: TestController) => {
    const {
      user,
      id: applicationId,
      ...application
    } = await loginAndfillApplication(t, 1);
    const headerUser = await headerComponents.headerUser();
    await headerUser.actions.clicklogoutButton();
    await doEmployerLogin(t, 'fi', user);
    await urlUtils.expectations.urlChangedToApplicationPage(
      'fi',
      applicationId
    );
    const step1Form = await step1Components.form();
    await step1Form.expectations.isFulFilledWith(application);
  });
} else {
  test('Fills up invoicer form and retrieves its data when reloading page', async (t: TestController) => {
    const { id: applicationId, ...step1FormData } =
      await loginAndfillApplication(t, 1);
    await urlUtils.expectations.urlChangedToApplicationPage(
      'fi',
      applicationId
    );
    const wizard = await getWizardComponents(t);
    await wizard.expectations.isPresent();
    const step2Accordion = await step2Components.employmentAccordion(0);
    await step2Accordion.expectations.isPresent();
    await urlUtils.actions.refreshPage();
    await step2Accordion.expectations.isPresent();
    await wizard.actions.clickGoToPreviousStepButton();
    const step1Form = await step1Components.form();
    await step1Form.expectations.isPresent();
    await step1Form.expectations.isFulFilledWith(step1FormData);
  });
}

test('can fill and send application and create another', async (t: TestController) => {
  const application = await loginAndfillApplication(t);
  const thankYouPage = getThankYouPageComponents(t);
  await thankYouPage.header();
  const summaryComponent = await thankYouPage.summaryComponent();
  await summaryComponent.expectations.isCompanyDataPresent(application.company);
  await summaryComponent.expectations.isFulFilledWith(application);
  const createNewApplicationButton =
    await thankYouPage.createNewApplicationButton();
  await createNewApplicationButton.actions.clickButton();
  await urlUtils.expectations.urlChangedToApplicationPage();
  await getWizardComponents(t);
  await urlUtils.expectations.urlHasNewApplicationId(application.id);
});
