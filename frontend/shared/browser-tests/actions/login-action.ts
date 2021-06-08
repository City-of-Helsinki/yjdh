import TestController from 'testcafe';

import User from '../../src/types/user';
import { getSuomiFiAuthenticationComponents } from '../components/suomiFiAuthentication.components';
import { getSuomiFiProfileComponents } from '../components/suomiFiProfile.components';
import { getSuomiFiTestIdentificationComponents } from '../components/suomiFiTestIdentification.components';
import isRealIntegrationsEnabled from '../utils/is-real-integrations-enabled';
import { getUrlUtils } from '../utils/url.utils';

let suomiFiAuthenticationComponents: ReturnType<
  typeof getSuomiFiAuthenticationComponents
>;
let suomiFiTestIdentificationComponents: ReturnType<
  typeof getSuomiFiTestIdentificationComponents
>;
let suomiFiProfileComponents: ReturnType<typeof getSuomiFiProfileComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

const doSuomiFiLogin = async (t: TestController): Promise<User> => {
  suomiFiAuthenticationComponents = getSuomiFiAuthenticationComponents(t);
  suomiFiTestIdentificationComponents = getSuomiFiTestIdentificationComponents(
    t
  );
  suomiFiProfileComponents = getSuomiFiProfileComponents(t);
  urlUtils = getUrlUtils(t);

  await urlUtils.expectations.urlChangedToAuthorizationEndpoint();
  const authenticatorSelector = await suomiFiAuthenticationComponents.authenticationSelector();
  await authenticatorSelector.actions.selectTestitunnistajaAuthentication();
  const identificationForm = await suomiFiTestIdentificationComponents.identificationForm();
  await identificationForm.actions.selectTestitunnistajaAuthentication();
  await identificationForm.actions.clickSubmitButton();
  const profileForm = await suomiFiProfileComponents.profileForm();
  const expecteduser = await profileForm.expectations.userDataIsPresent();
  await profileForm.actions.clickContinueButton();
  return expecteduser;
};
// eslint-disable-next-line arrow-body-style
export const doLogin = (t: TestController): Promise<User> | undefined => {
  if (isRealIntegrationsEnabled()) {
    return doSuomiFiLogin(t);
  }
  return undefined;
};
