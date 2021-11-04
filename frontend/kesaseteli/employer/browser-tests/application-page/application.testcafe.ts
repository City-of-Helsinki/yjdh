import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getFrontendUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import TestController from 'testcafe';

import { loginAndfillApplication } from '../actions/application.actions';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getUrlUtils } from '../utils/url.utils';
import { getApplicationPageComponents } from './applicationPage.components';

let applicationPageComponents: ReturnType<typeof getApplicationPageComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const url = getFrontendUrl('/');
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
      ...application
    } = await loginAndfillApplication(t, 1);
    const headerUser = await headerComponents.headerUser();
    await headerUser.actions.clicklogoutButton();
    await doEmployerLogin(t, 'fi', user);
    await urlUtils.expectations.urlChangedToApplicationPage(
      'fi',
      applicationId
    );
    const step1 = await applicationPageComponents.step1();
    await step1.expectations.isPresent();
    await step1.expectations.isFulFilledWith(application);
  });
} else {
  test('Fills up invoicer form and retrieves its data when reloading page', async (t: TestController) => {
    const { id: applicationId, ...step1FormData } =
      await loginAndfillApplication(t, 1);
    await urlUtils.expectations.urlChangedToApplicationPage(
      'fi',
      applicationId
    );
    const step2 = await applicationPageComponents.step2();
    await step2.actions.clickGoToPreviousStepButton();
    await applicationPageComponents.step1();
    await urlUtils.actions.refreshPage();
    const step1 = await applicationPageComponents.step1();
    await step1.expectations.isFulFilledWith(step1FormData);
  });
}

test('can fill and send application', async (t: TestController) => {
  await loginAndfillApplication(t, 2);
});
