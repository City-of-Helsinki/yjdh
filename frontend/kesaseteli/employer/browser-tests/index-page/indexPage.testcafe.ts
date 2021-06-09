import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { doEmployerLogin } from '../actions/employer-header.actions';
import { getPageLayoutComponents } from '../common-components/pageLayout.components';
import { getEmployerUiUrl } from '../utils/settings';
import { getIndexPageComponents } from './indexPage.components';

let indexPageComponents: ReturnType<typeof getIndexPageComponents>;
let pageLayoutComponents: ReturnType<typeof getPageLayoutComponents>;

fixture('Frontpage')
  .page(getEmployerUiUrl('/'))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    indexPageComponents = getIndexPageComponents(t);
    pageLayoutComponents = getPageLayoutComponents(t);
  });

test('user can authenticate and logout', async (t: TestController) => {
  const loggedUser = await doEmployerLogin(t);
  const indexPageHeader = await indexPageComponents.header();
  if (isRealIntegrationsEnabled() && loggedUser) {
    await indexPageHeader.expectations.userNameIsPresent(loggedUser);
  }
  await indexPageHeader.actions.clickLogoutButton();
  const loginHeader = await pageLayoutComponents.header();
  await loginHeader.expectations.loginButtonIsPresent();
});
