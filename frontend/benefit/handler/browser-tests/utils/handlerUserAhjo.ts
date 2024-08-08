import { ClientFunction, Role, Selector } from 'testcafe';

import { getFrontendUrl } from './url.utils';

const handlerUserAhjo = Role(getFrontendUrl('/'), async (t: TestController) => {
  // eslint-disable-next-line scanjs-rules/property_localStorage, scanjs-rules/identifier_localStorage
  await ClientFunction(() => window.localStorage.setItem('newAhjoMode', '1'))();
  const loginButton = Selector('[data-testid="main-login-button"]');
  await t.expect(loginButton.visible).ok();
  await t.click(loginButton);
});

export default handlerUserAhjo;
