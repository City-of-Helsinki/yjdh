import { Role } from 'testcafe';
import login from '../page-modal/login';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

const company = Role(url, async (t) => {
  await t.click(login.loginButton);
  // .click(login.loginOptionButton)
  // .click(login.defaultSSN)
  // .click(login.authenticateButton)
  // .click(login.continueButton)
  // .click(login.companyRadioButton)
  // .click(login.submitButton);
});

export default company;
