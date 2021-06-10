import TestController from 'testcafe';

import User from '../../src/types/user';
import { getSuomiFiAuthenticationComponents } from '../components/suomiFiAuthentication.components';
import { getSuomiFiProfileComponents } from '../components/suomiFiProfile.components';
import { getSuomiFiTestIdentificationComponents } from '../components/suomiFiTestIdentification.components';
import { getSuomiFiValtuutusComponents } from '../components/suomiFiValtuutus.components';
import isRealIntegrationsEnabled from '../utils/is-real-integrations-enabled';
import { getUrlUtils } from '../utils/url.utils';

let suomiFiAuthenticationComponents: ReturnType<
  typeof getSuomiFiAuthenticationComponents
>;
let suomiFiTestIdentificationComponents: ReturnType<
  typeof getSuomiFiTestIdentificationComponents
>;
let suomiFiProfileComponents: ReturnType<typeof getSuomiFiProfileComponents>;

let suomiFiValtuutusComponents: ReturnType<
  typeof getSuomiFiValtuutusComponents
>;
let urlUtils: ReturnType<typeof getUrlUtils>;

export type Expectations = {
  expectedUser: User;
  expectedCompany: RegExp;
};

const doSuomiFiLogin = async (t: TestController): Promise<Expectations> => {
  suomiFiAuthenticationComponents = getSuomiFiAuthenticationComponents(t);
  suomiFiTestIdentificationComponents = getSuomiFiTestIdentificationComponents(
    t
  );
  suomiFiProfileComponents = getSuomiFiProfileComponents(t);
  suomiFiValtuutusComponents = getSuomiFiValtuutusComponents(t);
  urlUtils = getUrlUtils(t);

  await urlUtils.expectations.urlChangedToAuthorizationEndpoint();
  const authenticatorSelector = await suomiFiAuthenticationComponents.authenticationSelector();
  await authenticatorSelector.actions.selectTestitunnistajaAuthentication();
  const identificationForm = await suomiFiTestIdentificationComponents.identificationForm();
  await identificationForm.actions.selectTestitunnistajaAuthentication();
  await identificationForm.actions.clickSubmitButton();
  const profileForm = await suomiFiProfileComponents.profileForm();
  const expectedUser = await profileForm.expectations.userDataIsPresent();
  await profileForm.actions.clickContinueButton();
  const companiesTable = await suomiFiValtuutusComponents.companiesTable();
  await companiesTable.actions.selectCompanyRadioButton(/activenakusteri oy/i);
  const authorizeForm = await suomiFiValtuutusComponents.authorizeForm();
  await authorizeForm.actions.clickSubmitButton();
  return { expectedUser, expectedCompany: /activenakusteri oy/i };
};
// eslint-disable-next-line arrow-body-style
export const doLogin = (
  t: TestController
): Promise<Expectations> | undefined => {
  if (isRealIntegrationsEnabled()) {
    return doSuomiFiLogin(t);
  }
  return undefined;
};
