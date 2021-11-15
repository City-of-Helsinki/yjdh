import {
  doLogin,
  SuomiFiData,
} from '@frontend/shared/browser-tests/actions/login-action';
import {
  getHeaderComponents,
  Translation,
} from '@frontend/shared/browser-tests/components/header.components';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';
import User from '@frontend/shared/src/types/user';
import TestController from 'testcafe';

export const appNameTranslation: Translation = {
  fi: 'Kesäseteli',
  en: 'Summer job voucher',
  sv: 'Sommarsedeln',
};

export const doEmployerLogin = async (
  t: TestController,
  lang = DEFAULT_LANGUAGE,
  cachedUser?: User
): Promise<SuomiFiData> => {
  const headerUser = await getHeaderComponents(
    t,
    appNameTranslation
  ).headerUser();
  await headerUser.expectations.userIsLoggedOut();
  await headerUser.actions.clickloginButton();
  const suomifiData = await doLogin(t, lang, cachedUser);
  if (suomifiData.user) {
    await headerUser.expectations.userIsLoggedIn(suomifiData.user);
  }
  return suomifiData;
};
