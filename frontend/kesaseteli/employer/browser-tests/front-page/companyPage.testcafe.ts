import { getEmployerUiUrl } from '../../../shared/browser-tests/utils/settings';
import { clearDataToPrintOnFailure } from '../../../shared/browser-tests/utils/testcafe.utils';
import Company from '../../src/types/company';
import { getCompanyPageComponents } from './companyPage.components';

let components: ReturnType<typeof getCompanyPageComponents>;

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
  .page(getEmployerUiUrl('/company'))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    components = getCompanyPageComponents(t);
  });

// eslint-disable-next-line jest/expect-expect
test('company data is present', async () => {
  const companyData = await components.companyData(expectedCompany);
  await companyData.expectations.isCompanyDataPresent();
});
