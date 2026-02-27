import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import Header from '@frontend/shared/browser-tests/page-models/Header';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import { convertToUIDateFormat } from '@frontend/shared/src/utils/date.utils';
import { Selector } from 'testcafe';

import getEmployerTranslationsApi from '../../src/__tests__/utils/i18n/get-employer-translations-api';
import { loginAndfillApplication } from '../actions/application.actions';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getDashboardComponents } from '../index-page/dashboard.components';
import { getThankYouPageComponents } from '../thankyou-page/thank-you.components';
import { getFrontendUrl, getUrlUtils } from '../utils/url.utils';
import {
  attachmentsMock,
  FULLY_MOCKED_FORM_DATA,
  getFetchEmployeeDataMock,
  MOCKED_EMPLOYEE_DATA,
  targetGroupsMock,
} from './application.mocks';
import { getStep1Components } from './step1.components';
import { getStep2Components } from './step2.components';
import { getWizardComponents } from './wizard.components';

let step1Components: ReturnType<typeof getStep1Components>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getFrontendUrl('/');

fixture('Application')
  .page(url)
  .requestHooks(
    requestLogger,
    new HttpRequestHook(url, getBackendDomain()),
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
  test.requestHooks(getFetchEmployeeDataMock(FULLY_MOCKED_FORM_DATA))(
    'Fills up employer form and retrieves its data when reloading page',
    async (t: TestController) => {
      const { id: applicationId, ...applicationData } =
        await loginAndfillApplication(t, 1, FULLY_MOCKED_FORM_DATA);
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
    }
  );
}

test.requestHooks(getFetchEmployeeDataMock(FULLY_MOCKED_FORM_DATA))(
  'can fill and send application and create another with pre-filled employer data',
  async (t: TestController) => {
    const application = await loginAndfillApplication(
      t,
      2,
      FULLY_MOCKED_FORM_DATA
    );
    const thankYouPage = getThankYouPageComponents(t);
    await thankYouPage.header();

    const createNewApplicationButton =
      await thankYouPage.createNewApplicationButton();
    await createNewApplicationButton.actions.clickButton();

    const wizard = await getWizardComponents(t);
    await wizard.expectations.isPresent();
    await urlUtils.expectations.urlHasNewApplicationId(application.id);

    const step1Form = await step1Components.form();
    await step1Form.expectations.isFulFilledWith(application);

    // Verify employment details are EMPTY for the new application
    await t.expect(step1Form.selectors.employeeNameInput().value).eql('');
    await t.expect(step1Form.selectors.serialNumberInput().value).eql('');
  }
);

test.requestHooks(getFetchEmployeeDataMock(FULLY_MOCKED_FORM_DATA))(
  'Fills up employer form and preserves data when navigating back and forth',
  async (t: TestController) => {
    const application = await loginAndfillApplication(
      t,
      1,
      FULLY_MOCKED_FORM_DATA
    );
    const wizard = await getWizardComponents(t);
    await wizard.expectations.isPresent();

    const step2 = getStep2Components(t);
    await step2.summaryComponent();

    // Go back to step 1
    await wizard.actions.clickGoToStep1Button();
    const step1Form = await step1Components.form();
    await step1Form.expectations.isPresent();

    // Verify ALL fields are preserved, including problematic ones
    await step1Form.expectations.isFulFilledWith(application);
    await step1Form.expectations.isEmploymentFulfilledWith(
      application.summer_vouchers[0]
    );
    await step1Form.expectations.isEmploymentSupplementFulfilledWith({
      target_group: application.summer_vouchers[0].target_group,
      employment_start_date: convertToUIDateFormat(
        application.summer_vouchers[0].employment_start_date
      ),
      employment_end_date: convertToUIDateFormat(
        application.summer_vouchers[0].employment_end_date
      ),
      hired_without_voucher_assessment:
        application.summer_vouchers[0].hired_without_voucher_assessment,
    });
  }
);
