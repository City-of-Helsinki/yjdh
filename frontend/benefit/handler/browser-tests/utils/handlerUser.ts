import { Selector } from 'testcafe';
import { Role } from 'testcafe';
import { getFrontendUrl } from './url.utils';

const handlerUser = Role(getFrontendUrl('/login'), async (t) => {
  const loginButton = Selector('main button')
    .find('span')
    .withText('Kirjaudu palveluun');
  await t.click(loginButton);
});

export default handlerUser;
