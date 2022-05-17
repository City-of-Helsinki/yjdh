import { doLogin, SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import Header from '@frontend/shared/browser-tests/page-models/Header';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';
import User from '@frontend/shared/src/types/user';
import TestController from 'testcafe';

import getTetAdminTranslationsApi from '../../src/__tests__/utils/i18n/get-tet-admin-translations-api';

export const doTetAdminLogin = async (
  t: TestController,
  lang = DEFAULT_LANGUAGE,
  cachedUser?: User,
): Promise<SuomiFiData> => {
  const headerUser = new Header(getTetAdminTranslationsApi());
  await headerUser.userIsLoggedOut();
  await headerUser.clickLoginButton();
  return doLogin(t, lang, cachedUser);
};
