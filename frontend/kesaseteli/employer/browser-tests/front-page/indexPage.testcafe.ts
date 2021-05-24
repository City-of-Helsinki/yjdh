import { getSuomiFiAuthenticationComponents } from '@frontend/shared/browser-tests/components/suomiFiAuthentication.components';
import { getSuomiFiProfileComponents } from '@frontend/shared/browser-tests/components/suomiFiProfile.components';
import { getSuomiFiTestIdentificationComponents } from '@frontend/shared/browser-tests/components/suomiFiTestIdentification.components';
import { getEmployerUiUrl } from '@frontend/shared/browser-tests/utils/settings';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getUrlUtils } from '@frontend/shared/browser-tests/utils/url.utils';

import { getPageLayoutComponents } from '../common-components/pageLayout.components';
import { getIndexPageComponents } from './indexPage.components';

let indexPageComponents: ReturnType<typeof getIndexPageComponents>;
let pageLayoutComponents: ReturnType<typeof getPageLayoutComponents>;
let suomiFiAuthenticationComponents: ReturnType<
  typeof getSuomiFiAuthenticationComponents
>;
let suomiFiTestIdentificationComponents: ReturnType<
  typeof getSuomiFiTestIdentificationComponents
>;
let suomiFiProfileComponents: ReturnType<typeof getSuomiFiProfileComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

fixture('Frontpage')
  .page(getEmployerUiUrl('/'))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    indexPageComponents = getIndexPageComponents(t);
    pageLayoutComponents = getPageLayoutComponents(t);
    suomiFiAuthenticationComponents = getSuomiFiAuthenticationComponents(t);
    suomiFiTestIdentificationComponents = getSuomiFiTestIdentificationComponents(
      t
    );
    suomiFiProfileComponents = getSuomiFiProfileComponents(t);
    urlUtils = getUrlUtils(t);
  });

// eslint-disable-next-line jest/expect-expect
test('user can authenticate and logout', async () => {
  const loginHeader = await pageLayoutComponents.header();
  await loginHeader.actions.clickLoginbutton();
  await urlUtils.expectations.urlChangedToAuthorizationEndpoint();
  const authenticatorSelector = await suomiFiAuthenticationComponents.authenticationSelector();
  await authenticatorSelector.actions.selectTestitunnistajaAuthentication();
  const identificationForm = await suomiFiTestIdentificationComponents.identificationForm();
  await identificationForm.actions.selectTestitunnistajaAuthentication();
  await identificationForm.actions.clickSubmitButton();
  const profileForm = await suomiFiProfileComponents.profileForm();
  const expecteduser = await profileForm.expectations.userDataIsPresent();
  await profileForm.actions.clickContinueButton();
  const indexPageHeader = await indexPageComponents.header();
  await indexPageHeader.expectations.userNameIsPresent(expecteduser);
  await indexPageHeader.actions.clickLogoutButton();
  // TODO: finalize logout, now it does not work
});
