import { Role } from 'testcafe';

import { getFrontendUrl } from './url.utils';

const handlerUser = Role(getFrontendUrl('/'), async (t: TestController) => {
  // We will have to click this with ad hoc selector because login causes some internal reloads that testcafe fails to detect
  await t.click('[data-testid="main-login-button"]');
});

export default handlerUser;
