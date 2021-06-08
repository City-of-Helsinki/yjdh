import { doLogin } from '@frontend/shared/browser-tests/actions/login-action';
import User from '@frontend/shared/src/types/user';
import TestController from 'testcafe';

import { getPageLayoutComponents } from '../common-components/pageLayout.components';

let pageLayoutComponents: ReturnType<typeof getPageLayoutComponents>;

export const doEmployerLogin = async (
  t: TestController
): Promise<User | undefined> => {
  pageLayoutComponents = getPageLayoutComponents(t);
  const loginHeader = await pageLayoutComponents.header();
  await loginHeader.actions.clickLoginbutton();
  return doLogin(t);
};
