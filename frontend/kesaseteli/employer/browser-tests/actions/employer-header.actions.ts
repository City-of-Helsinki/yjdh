import {
  doLogin,
  SuomiFiData,
} from '@frontend/shared/browser-tests/actions/login-action';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import User from '@frontend/shared/src/types/user';
import TestController from 'testcafe';

export const doEmployerLogin = async (
  t: TestController,
  cachedUser?: User
): Promise<SuomiFiData | undefined> => {
  const headerUser = await getHeaderComponents(t).headerUser();
  await headerUser.expectations.userIsLoggedOut();
  await headerUser.actions.clickloginButton();
  const suomifiData = await doLogin(t, cachedUser);
  await headerUser.expectations.userIsLoggedIn();
  return suomifiData;
};
