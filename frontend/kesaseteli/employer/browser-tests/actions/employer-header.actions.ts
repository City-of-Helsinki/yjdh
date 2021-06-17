import {
  doLogin,
  Expectations,
} from '@frontend/shared/browser-tests/actions/login-action';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import TestController from 'testcafe';

export const doEmployerLogin = async (
  t: TestController
): Promise<Expectations | undefined> => {
  const headerUser = await getHeaderComponents(t).headerUser();
  await headerUser.expectations.userIsLoggedOut();
  await headerUser.actions.clickloginButton();
  const expectations = await doLogin(t);
  await headerUser.expectations.userIsLoggedIn();
  return expectations;
};
