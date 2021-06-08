import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import Company from '../../src/types/company';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';
import { getUrlUtils } from '../utils/url.utils';
import { getCompanyPageComponents } from './companyPage.components';
import { getIndexPageComponents } from './indexPage.components';

let components: ReturnType<typeof getCompanyPageComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;
let indexPageComponents: ReturnType<typeof getIndexPageComponents>;

const expectedCompany: Company = {
  id: 'id',
  name: 'I. Haanpää Oy',
  business_id: '0877830-0',
  industry: 'Taloustavaroiden vähittäiskauppa',
  street_address: 'Vasaratie 4 A 3',
  postcode: '65350',
  city: 'Vaasa',
};

fixture('Companypage')
  .page(getEmployerUiUrl('/'))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    urlUtils = getUrlUtils(t);
    components = getCompanyPageComponents(t);
    indexPageComponents = getIndexPageComponents(t);
  });

test('company data is present only when logged in out', async (t: TestController) => {
  await urlUtils.actions.navigateToLoginPage();
  await doEmployerLogin(t);
  // shows company data after login
  await urlUtils.actions.navigateToCompanyPage();
  await urlUtils.expectations.urlChangedToCompanyPage();
  const companyData = await components.companyData(expectedCompany);
  await companyData.expectations.isCompanyDataPresent();
  await urlUtils.actions.navigateToIndexPage();
  const indexPageHeader = await indexPageComponents.header();
  await indexPageHeader.actions.clickLogoutButton();
  // does not show company data after logout. Instead redirects to login page
  await urlUtils.actions.navigateToCompanyPage();
  await urlUtils.expectations.urlChangedToCompanyPage();
  await urlUtils.expectations.urlChangedToLoginPage();
});
