import { ClientFunction, Role } from 'testcafe';

import { getFrontendUrl } from './url.utils';

const handlerUserAhjo = Role(getFrontendUrl('/'), async (t: TestController) => {
  // eslint-disable-next-line scanjs-rules/property_localStorage, scanjs-rules/identifier_localStorage
  await ClientFunction(() => window.localStorage.setItem('newAhjoMode', '1'))();
  await t.click('[data-testid="main-login-button"]');
});

export default handlerUserAhjo;
