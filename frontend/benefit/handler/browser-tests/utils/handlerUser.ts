import { Role, Selector } from 'testcafe';

import { getFrontendUrl } from './url.utils';

const handlerUser = Role(getFrontendUrl('/login'), async (t) => {
  const loginButton = Selector('button').withAttribute(
    'data-testid',
    'main-login-button'
  );
  // Click the <button> element, otherwise causes selector timeout before click
  await t.click(loginButton);
});

export default handlerUser;
