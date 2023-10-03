import { Role } from 'testcafe';

import Login from '../page-model/login';
import TermsOfService from '../page-model/TermsOfService';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

const applicantRole = Role(
  url,
  async (t: TestController) => {
    await t.click(Login.loginButton);
    const termsAndConditions = new TermsOfService();
    await termsAndConditions.isLoaded();
    await termsAndConditions.clickContinueButton();
  },
  {
    preserveUrl: true,
  }
);

export default applicantRole;
