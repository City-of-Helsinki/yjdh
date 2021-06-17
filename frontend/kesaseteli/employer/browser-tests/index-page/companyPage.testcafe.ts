import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import Company from '../../src/types/company';
import { doEmployerLogin } from '../actions/employer-header.actions';
import { getEmployerUiUrl } from '../utils/settings';
import { getCompanyPageComponents } from './companyPage.components';
import { getIndexPageComponents } from './indexPage.components';

let components: ReturnType<typeof getCompanyPageComponents>;
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

const url = getEmployerUiUrl('/');

fixture('Companypage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    components = getCompanyPageComponents(t);
    indexPageComponents = getIndexPageComponents(t);
  });

test('company data is present when logged in', async (t: TestController) => {
  await doEmployerLogin(t);
  // shows company data after login
  const indexPageHeader = await indexPageComponents.mainContent();
  await indexPageHeader.actions.clickCreateNewApplicationButton();
  const companyData = await components.companyData(expectedCompany);
  await companyData.expectations.isCompanyDataPresent();
});
