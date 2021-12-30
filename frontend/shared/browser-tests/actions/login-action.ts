import TestController from 'testcafe';

import { DEFAULT_LANGUAGE } from '../../src/i18n/i18n';
import Company from '../../src/types/company';
import User from '../../src/types/user';
import { getSuomiFiAuthenticationComponents } from '../components/suomiFiAuthentication.components';
import { getSuomiFiProfileComponents } from '../components/suomiFiProfile.components';
import { getSuomiFiTestIdentificationComponents } from '../components/suomiFiTestIdentification.components';
import { getSuomiFiValtuutusComponents } from '../components/suomiFiValtuutus.components';
import { getUrlApi } from '../components/url.api';
import isRealIntegrationsEnabled from '../utils/is-real-integrations-enabled';

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
let urlUtils: ReturnType<typeof getUrlApi>;

export type SuomiFiData = {
  user?: User;
  company?: Company;
};

const doSuomiFiLogin = async (
  t: TestController,
  lang = DEFAULT_LANGUAGE,
  cachedUser?: User
): Promise<SuomiFiData> => {
  // when logging in second time, suomifi remembers the user from previous session so following steps are skipped
  if (!cachedUser) {
    suomiFiAuthenticationComponents = getSuomiFiAuthenticationComponents(t);
    suomiFiTestIdentificationComponents =
      getSuomiFiTestIdentificationComponents(t);
    suomiFiProfileComponents = getSuomiFiProfileComponents(t);
    suomiFiValtuutusComponents = getSuomiFiValtuutusComponents(t);
    urlUtils = getUrlApi(t);

    await urlUtils.expectations.urlChangedToAuthorizationEndpoint();
    const authenticatorSelector =
      await suomiFiAuthenticationComponents.authenticationSelector();
    await authenticatorSelector.actions.selectTestitunnistajaAuthentication();
    const identificationForm =
      await suomiFiTestIdentificationComponents.identificationForm();
    await identificationForm.actions.selectTestitunnistajaAuthentication();
    await identificationForm.actions.clickSubmitButton();
  }
  const profileForm = await suomiFiProfileComponents.profileForm();
  const user = await profileForm.expectations.userDataIsPresent();
  if (cachedUser) {
    await t.expect(user).eql(cachedUser);
  }
  await profileForm.actions.clickContinueButton();
  const companiesTable = await suomiFiValtuutusComponents.companiesTable();
  const company = await companiesTable.actions.selectCompanyRadioButton(2);
  const authorizeForm = await suomiFiValtuutusComponents.authorizeForm();
  await authorizeForm.actions.clickSubmitButton(lang);
  return { user, company };
};
// eslint-disable-next-line arrow-body-style
export const doLogin = (
  t: TestController,
  lang = DEFAULT_LANGUAGE,
  cachedUser?: User
): Promise<SuomiFiData> => {
  if (isRealIntegrationsEnabled()) {
    return doSuomiFiLogin(t, lang, cachedUser);
  }
  return Promise.resolve({});
};
